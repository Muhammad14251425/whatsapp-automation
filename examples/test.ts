import { BaileysClass } from "../lib/baileys.js"
import fs from "fs"

// Types based on your JSON structure
interface MessageConfig {
  type: "text" | "image" | "audio" | "video" | "document"
  content?: string
  url?: string
  caption?: string
  delay?: number
}

interface UserSession {
  currentFlow: string | null
  currentStep: string
  userData: Record<string, any>
  cart: any[]
  awaitingInput: string | null
  conversationHistory: Array<{
    timestamp: Date
    message: string
    type: "user" | "bot"
  }>
  lastActivity: Date
}

interface FlowOption {
  id: string
  triggers: string[]
  label: string
  next_step: string
  messages?: MessageConfig[]
}

interface CollectInput {
  type: string
  store_as: string
  validation?: {
    required?: boolean
    min_length?: number
    max_length?: number
    pattern?: string
  }
}

interface FlowStep {
  id: string
  name?: string
  messages?: MessageConfig[]
  options?: FlowOption[]
  collect_input?: CollectInput
  next_step?: string
  invalid_option_message?: string
  show_menu_after_invalid?: boolean
  auto_proceed_to?: string
}

interface Category {
  id: string
  name: string
  emoji?: string
  description?: string
  image?: string
  triggers?: string[]
  products: Product[]
}

interface Product {
  id: string
  name: string
  price: string
  description: string
  images: string[]
  stock: number
  category_id: string
  variants?: any[]
}

interface BotConfig {
  bot_info: {
    name: string
    business_type: string
    description: string
    logo?: string
  }
  greeting: {
    triggers: string[]
    messages: MessageConfig[]
    auto_proceed_to?: string
  }
  main_menu: FlowStep
  categories?: Category[]
  flows?: Record<string, FlowStep[]>
  global_settings: {
    fallback_message: string
    session_timeout: number
    default_delay_between_messages: number
    enable_typing_indicator: boolean
    business_hours?: any
  }
  quick_replies?: {
    common_responses: Array<{
      trigger: string
      response: string
    }>
  }
  integrations?: any
  automated_responses?: any
  personalization?: any
}

const botBaileys = new BaileysClass({})

botBaileys.on("auth_failure", (error) => console.log("ERROR BOT: ", error))
botBaileys.on("qr", (qr) => console.log("NEW QR CODE: ", qr))
botBaileys.on("ready", () => console.log("READY BOT"))

// Load bot configuration from JSON file
let botConfig: BotConfig
try {
  const configPath = "./examples/bot-config.json"
  const configData = fs.readFileSync(configPath, "utf8")
  botConfig = JSON.parse(configData)
  console.log("Bot configuration loaded successfully")
} catch (error) {
  console.error("Error loading bot configuration:", error)
  process.exit(1)
}

// User session management
const userSessions: Record<string, UserSession> = {}

class DynamicBotEngine {
  private config: BotConfig

  constructor(config: BotConfig) {
    this.config = config
  }

  // Initialize user session
  initUserSession(userId: string): UserSession {
    if (!userSessions[userId]) {
      userSessions[userId] = {
        currentFlow: null,
        currentStep: "greeting",
        userData: {},
        cart: [],
        awaitingInput: null,
        conversationHistory: [],
        lastActivity: new Date(),
      }
    }
    userSessions[userId].lastActivity = new Date()
    return userSessions[userId]
  }

  // Check if message matches any triggers
  matchesTriggers(message: string, triggers: string[]): boolean {
    const text = message.toLowerCase().trim()
    return triggers.some(
      (trigger) => text === trigger.toLowerCase() || text.includes(trigger.toLowerCase()) || text === trigger,
    )
  }

  // Check if message is a greeting
  isGreeting(message: string): boolean {
    return this.matchesTriggers(message, this.config.greeting.triggers)
  }

  // Check quick replies
  checkQuickReplies(message: string): string | null {
    if (!this.config.quick_replies?.common_responses) return null

    const quickReply = this.config.quick_replies.common_responses.find((reply) =>
      this.matchesTriggers(message, [reply.trigger]),
    )
    return quickReply ? quickReply.response : null
  }

  // Send multiple messages with proper delays
  async sendMessages(sender: string, messages: MessageConfig[]): Promise<void> {
    for (const msg of messages) {
      if (this.config.global_settings.enable_typing_indicator) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      await this.sendSingleMessage(sender, msg)

      const delay = msg.delay || this.config.global_settings.default_delay_between_messages
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // Send single message based on type
  async sendSingleMessage(sender: string, messageConfig: MessageConfig): Promise<void> {
    try {
      switch (messageConfig.type) {
        case "text":
          await botBaileys.sendText(sender, messageConfig.content || "")
          break
        case "image":
          await botBaileys.sendImage(sender, messageConfig.url || "", messageConfig.caption || "")
          break
        case "audio":
          await botBaileys.sendAudio(sender, messageConfig.url || "")
          break
        case "video":
          await botBaileys.sendVideo(sender, messageConfig.url || "", messageConfig.caption || "")
          break
        case "document":
          await botBaileys.sendFile(sender, messageConfig.url || "")
          break
        default:
          console.warn("Unknown message type:", messageConfig.type)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Find step by ID across all flows and main structures
  findStepById(stepId: string): { step: FlowStep; flowName?: string } | null {
    // Check main menu
    if (stepId === "main_menu") {
      return { step: this.config.main_menu }
    }

    // Check flows
    if (this.config.flows) {
      for (const [flowName, flowSteps] of Object.entries(this.config.flows)) {
        const step = flowSteps.find((s) => s.id === stepId)
        if (step) {
          return { step, flowName }
        }
      }
    }

    // Check if it's a special step (categories, etc.)
    if (stepId === "categories" && this.config.categories) {
      return {
        step: {
          id: "categories",
          messages: this.generateCategoryMessages(),
        },
      }
    }

    return null
  }

  // Generate category messages dynamically from config
  generateCategoryMessages(): MessageConfig[] {
    if (!this.config.categories) return []

    const categoryText = this.config.categories.map((cat, index) => `${cat.emoji || ""} ${cat.name}`).join("\n")

    return [
      {
        type: "text",
        content: `🛍️ Choose a category:\n\n${categoryText}`,
        delay: 500,
      },
    ]
  }

  // Generate product messages dynamically from config
  generateProductMessages(category: Category): MessageConfig[] {
    const messages: MessageConfig[] = [
      {
        type: "text",
        content: `${category.emoji || "🛍️"} ${category.name}`,
        delay: 300,
      },
    ]

    // Add category image if available
    if (category.image) {
      messages.push({
        type: "image",
        url: category.image,
        caption: category.description || `${category.name} Collection`,
        delay: 500,
      })
    }

    // Add products
    const products = category.products.slice(0, 3) // Show first 3 products
    products.forEach((product) => {
      if (product.images && product.images.length > 0) {
        messages.push({
          type: "image",
          url: product.images[0],
          caption: `${product.name}\n💰 ${product.price}\n📝 ${product.description}\n📦 Stock: ${product.stock}`,
          delay: 800,
        })
      }
    })

    // Add navigation message
    messages.push({
      type: "text",
      content: "Reply with product name to get more details or 'MENU' to go back.",
      delay: 300,
    })

    return messages
  }

  // Main message processing function
  async processUserInput(sender: string, message: string): Promise<void> {
    const session = this.initUserSession(sender)
    const text = message.toLowerCase().trim()

    // Add to conversation history
    session.conversationHistory.push({
      timestamp: new Date(),
      message: message,
      type: "user",
    })

    // Check for quick replies first
    const quickReplyResponse = this.checkQuickReplies(message)
    if (quickReplyResponse) {
      return await this.navigateToStep(sender, session, quickReplyResponse)
    }

    // Handle greeting
    if (this.isGreeting(message) || session.currentStep === "greeting") {
      return await this.handleGreeting(sender, session)
    }

    // Handle current step dynamically
    await this.handleCurrentStep(sender, session, message)
  }

  // Handle greeting flow
  async handleGreeting(sender: string, session: UserSession): Promise<void> {
    // Send greeting messages
    await this.sendMessages(sender, this.config.greeting.messages)

    // Auto proceed to next step if specified
    if (this.config.greeting.auto_proceed_to) {
      session.currentStep = this.config.greeting.auto_proceed_to
      await this.navigateToStep(sender, session, this.config.greeting.auto_proceed_to)
    }
  }

  // Handle current step dynamically
  async handleCurrentStep(sender: string, session: UserSession, message: string): Promise<void> {
    const currentStepData = this.findStepById(session.currentStep)

    if (!currentStepData) {
      return await this.sendFallbackMessage(sender)
    }

    const { step, flowName } = currentStepData

    // Update current flow if we're in a flow
    if (flowName) {
      session.currentFlow = flowName
    }

    // Handle input collection
    if (step.collect_input) {
      return await this.handleInputCollection(sender, session, message, step)
    }

    // Handle options selection
    if (step.options) {
      return await this.handleOptionsSelection(sender, session, message, step)
    }

    // Handle special cases
    await this.handleSpecialCases(sender, session, message)
  }

  // Handle input collection
  async handleInputCollection(sender: string, session: UserSession, message: string, step: FlowStep): Promise<void> {
    const collectInput = step.collect_input!

    // Validate input if validation rules exist
    if (collectInput.validation) {
      const isValid = this.validateInput(message, collectInput.validation)
      if (!isValid) {
        await botBaileys.sendText(sender, "Invalid input. Please try again.")
        return
      }
    }

    // Store the input
    session.userData[collectInput.store_as] = message

    // Navigate to next step
    if (step.next_step) {
      session.currentStep = step.next_step
      await this.navigateToStep(sender, session, step.next_step)
    }
  }

  // Validate input based on validation rules
  validateInput(input: string, validation: any): boolean {
    if (validation.required && !input.trim()) {
      return false
    }

    if (validation.min_length && input.length < validation.min_length) {
      return false
    }

    if (validation.max_length && input.length > validation.max_length) {
      return false
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(input)) {
        return false
      }
    }

    return true
  }

  // Handle options selection
  async handleOptionsSelection(sender: string, session: UserSession, message: string, step: FlowStep): Promise<void> {
    const selectedOption = step.options!.find((option) => this.matchesTriggers(message, option.triggers))

    if (selectedOption) {
      // Send option-specific messages if any
      if (selectedOption.messages && selectedOption.messages.length > 0) {
        await this.sendMessages(sender, selectedOption.messages)
      }

      // Navigate to next step
      session.currentStep = selectedOption.next_step
      await this.navigateToStep(sender, session, selectedOption.next_step)
    } else {
      // Invalid option
      const invalidMessage = step.invalid_option_message || this.config.global_settings.fallback_message
      await botBaileys.sendText(sender, invalidMessage)

      // Show menu again if configured
      if (step.show_menu_after_invalid && step.messages) {
        await this.sendMessages(sender, step.messages)
      }
    }
  }

  // Handle special cases (categories, products, etc.)
  async handleSpecialCases(sender: string, session: UserSession, message: string): Promise<void> {
    const text = message.toLowerCase().trim()

    // Handle category selection
    if (session.currentStep === "categories" && this.config.categories) {
      const selectedCategory = this.config.categories.find(
        (category) =>
          this.matchesTriggers(message, category.triggers || []) ||
          category.name.toLowerCase().includes(text) ||
          category.id.toLowerCase() === text,
      )

      if (selectedCategory) {
        session.userData.selectedCategory = selectedCategory
        const productMessages = this.generateProductMessages(selectedCategory)
        await this.sendMessages(sender, productMessages)
        session.currentStep = "product_selection"
        return
      }
    }

    // Handle product selection
    if (session.currentStep === "product_selection" && session.userData.selectedCategory) {
      const category = session.userData.selectedCategory as Category
      const selectedProduct = category.products.find(
        (product) => product.name.toLowerCase().includes(text) || product.id.toLowerCase() === text,
      )

      if (selectedProduct) {
        session.userData.selectedProduct = selectedProduct
        // You can add more product handling logic here based on your config
        await botBaileys.sendText(sender, `You selected: ${selectedProduct.name}\nPrice: ${selectedProduct.price}`)
        return
      }
    }

    // Default fallback
    await this.sendFallbackMessage(sender)
  }

  // Navigate to specific step
  async navigateToStep(sender: string, session: UserSession, stepId: string): Promise<void> {
    const stepData = this.findStepById(stepId)

    if (!stepData) {
      console.warn(`Step not found: ${stepId}`)
      return await this.sendFallbackMessage(sender)
    }

    const { step, flowName } = stepData

    // Update session
    session.currentStep = stepId
    if (flowName) {
      session.currentFlow = flowName
    } else {
      session.currentFlow = null
    }

    // Send step messages
    if (step.messages && step.messages.length > 0) {
      await this.sendMessages(sender, step.messages)
    }

    // Auto proceed if configured
    if (step.auto_proceed_to) {
      session.currentStep = step.auto_proceed_to
      await this.navigateToStep(sender, session, step.auto_proceed_to)
    }
  }

  // Send fallback message
  async sendFallbackMessage(sender: string): Promise<void> {
    await botBaileys.sendText(sender, this.config.global_settings.fallback_message)

    // Return to main menu
    const session = userSessions[sender]
    if (session) {
      session.currentStep = "main_menu"
      session.currentFlow = null
      await this.sendMessages(sender, this.config.main_menu.messages || [])
    }
  }

  // Clean up expired sessions
  cleanupSessions(): void {
    const timeout = this.config.global_settings.session_timeout * 60 * 1000
    const now = new Date()

    Object.keys(userSessions).forEach((userId) => {
      const session = userSessions[userId]
      if (now.getTime() - session.lastActivity.getTime() > timeout) {
        delete userSessions[userId]
        console.log(`Session expired for user: ${userId}`)
      }
    })
  }

  // Dynamic template replacement
  replaceTemplateVariables(text: string, session: UserSession): string {
    let result = text

    // Replace user data variables
    Object.keys(session.userData).forEach((key) => {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, "g"), session.userData[key])
    })

    // Replace bot info variables
    result = result.replace(/{bot_name}/g, this.config.bot_info.name)
    result = result.replace(/{business_type}/g, this.config.bot_info.business_type)

    return result
  }
}

// Initialize dynamic bot engine
const dynamicBotEngine = new DynamicBotEngine(botConfig)

// Clean up sessions every 30 minutes
setInterval(
  () => {
    dynamicBotEngine.cleanupSessions()
  },
  30 * 60 * 1000,
)

// Main message handler
botBaileys.on("message", async (message) => {
  try {
    const sender = message.from
    const text = message.body?.trim() || ""

    console.log(`Message from ${sender}: ${text}`)

    await dynamicBotEngine.processUserInput(sender, text)
  } catch (error) {
    console.error("Error processing message:", error)

    try {
      await botBaileys.sendText(
        message.from,
        "Sorry, I encountered an error. Please try again or type 'MENU' to return to the main menu.",
      )
    } catch (sendError) {
      console.error("Error sending error message:", sendError)
    }
  }
})

// Export for external use
export { DynamicBotEngine, botBaileys }
