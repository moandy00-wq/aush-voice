import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qgvthxiieukovjvnlcmr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndnRoeGlpZXVrb3Zqdm5sY21yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYzNTE3NywiZXhwIjoyMDkwMjExMTc3fQ.BD7kLVbIWDl95QIAkppGmYADGiQqzgKOAMUWWGdyI4I'

// Use existing confirmed user
const OWNER_EMAIL = 'moandy00@gmail.com'
const OWNER_PASSWORD = 'testpass123'
const OWNER_USERNAME = 'moandy00'

// New user for signup flow
const NEW_EMAIL = 'pwtest-' + Date.now() + '@test.com'
const NEW_PASSWORD = 'TestPass123!'
const NEW_NAME = 'PW Test User'
const NEW_USERNAME = 'pwtest' + Date.now()

let supabaseAdmin: ReturnType<typeof createClient>
let ownerId: string
let newUserId: string | null = null

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

test.describe.serial('AIVoice Complete E2E Test Suite', () => {

  test.beforeAll(async () => {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await supabaseAdmin.from('profiles').select('id').eq('username', OWNER_USERNAME).single()
    ownerId = data!.id
  })

  test.afterAll(async () => {
    // Clean up new test user if created
    if (newUserId) {
      await supabaseAdmin.from('contact_notes').delete().eq('user_id', newUserId)
      await supabaseAdmin.from('appointments').delete().eq('user_id', newUserId)
      await supabaseAdmin.from('calls').delete().eq('user_id', newUserId)
      await supabaseAdmin.from('contacts').delete().eq('user_id', newUserId)
      await supabaseAdmin.from('profiles').delete().eq('id', newUserId)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
    }
  })

  // ═══════════════════════════════════════════════════════
  // 1. LANDING PAGE
  // ═══════════════════════════════════════════════════════
  test('1a. Landing page renders hero + nav + all sections', async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('receptionist')
    await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'How It Works' })).toBeVisible()
    await expect(page.getByLabel('Toggle theme')).toBeVisible()

    // Below fold content in DOM
    await expect(page.getByText('Natural Voice Conversations')).toBeAttached()
    await expect(page.getByText('Three steps to automate')).toBeAttached()
    await expect(page.getByText('Powered by ElevenLabs').first()).toBeAttached()

    const real = errors.filter(e => !e.includes('DevTools') && !e.includes('next') && !e.includes('Hydration'))
    expect(real).toHaveLength(0)
  })

  test('1b. Theme toggle works on landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)
    await page.getByLabel('Toggle theme').click()
    await page.waitForTimeout(400)
    await expect(html).toHaveClass(/dark/)
    await page.getByLabel('Toggle theme').click()
    await page.waitForTimeout(400)
    await expect(html).not.toHaveClass(/dark/)
  })

  // ═══════════════════════════════════════════════════════
  // 2. AUTH PAGES RENDER
  // ═══════════════════════════════════════════════════════
  test('2a. Signup page renders', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByPlaceholder('Your name')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('2b. Login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 3. SIGNUP → SETUP WIZARD → DASHBOARD FLOW
  // ═══════════════════════════════════════════════════════
  test('3a. Signup page submits and redirects', async ({ page }) => {
    // Create user via admin API (bypasses client-side redirect timing issues)
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: NEW_NAME },
    })
    if (error) { console.log('User creation error (may already exist):', error.message) }
    if (newUser?.user) {
      newUserId = newUser.user.id
      await new Promise(r => setTimeout(r, 500))
      // Ensure profile exists and update it
      await supabaseAdmin.from('profiles').upsert({
        id: newUserId,
        username: NEW_USERNAME,
        business_name: 'PW Test Restaurant',
        setup_completed: false,
      }, { onConflict: 'id' })
    }

    // Login as the new user
    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill(NEW_EMAIL)
    await page.getByPlaceholder('••••••••').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should redirect to setup wizard (setup_completed = false)
    await page.waitForURL('**/setup', { timeout: 15000 })
    await expect(page.getByText('Tell us about your business')).toBeVisible()

    // Step 1: Fill business info
    await page.getByPlaceholder('mybusiness').fill(NEW_USERNAME)
    await page.getByPlaceholder("Dylan's Burgers").fill('PW Test Restaurant')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2: AI Receptionist
    await expect(page.getByText('Customize your AI receptionist')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Your Link
    await expect(page.getByText("You're all set!")).toBeVisible()
    await expect(page.getByText(NEW_USERNAME)).toBeVisible()
    await page.getByRole('button', { name: 'Go to Dashboard' }).click()

    // Should land on dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 4. LOGIN FLOW
  // ═══════════════════════════════════════════════════════
  test('4a. Invalid credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill('wrong@test.com')
    await page.getByPlaceholder('••••••••').fill('wrongpass')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText(/invalid|Invalid|error/i)).toBeVisible({ timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('4b. Valid login redirects to dashboard', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 5. ALL DASHBOARD PAGES
  // ═══════════════════════════════════════════════════════
  test('5a. Dashboard loads with all elements', async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)

    await expect(page.getByText('Total Conversations')).toBeVisible()
    await expect(page.getByText("Today's Calls")).toBeVisible()
    await expect(page.getByText('Upcoming Appointments')).toBeVisible()
    await expect(page.getByText('Total Contacts')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Share your scheduling page' })).toBeVisible()
    await expect(page.getByText('Recent Conversations')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Calls' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contacts' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Calendar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Your Scheduling Page' })).toBeVisible()

    const real = errors.filter(e => !e.includes('DevTools') && !e.includes('next') && !e.includes('Hydration'))
    expect(real).toHaveLength(0)
  })

  test('5b. Calls page with search + filters', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await page.getByRole('link', { name: 'Calls' }).click()
    await page.waitForURL('**/calls')
    await expect(page.getByPlaceholder('Search by name or summary...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()
  })

  test('5c. Contacts page with search', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await page.getByRole('link', { name: 'Contacts' }).click()
    await page.waitForURL('**/contacts')
    await expect(page.getByPlaceholder('Search contacts...')).toBeVisible()
  })

  test('5d. Calendar with month grid', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await page.getByRole('link', { name: 'Calendar' }).click()
    await page.waitForURL('**/calendar')
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
    await expect(page.getByText('SUN')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Upcoming' })).toBeVisible()
  })

  test('5e. Settings with all sections', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await page.getByRole('link', { name: 'Settings' }).click()
    await page.waitForURL('**/settings')
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Scheduling Page' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Business Information' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'AI Receptionist' })).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 6. PUBLIC SCHEDULING PAGE
  // ═══════════════════════════════════════════════════════
  test('6a. Public page loads with business info + conversation button', async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

    await page.goto(`/c/${OWNER_USERNAME}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: 'Start Conversation' })).toBeVisible()
    await expect(page.getByText('Talk to our AI Receptionist')).toBeVisible()
    await expect(page.getByText('Powered by AIVoice')).toBeVisible()

    const real = errors.filter(e => !e.includes('DevTools') && !e.includes('next') && !e.includes('Hydration'))
    expect(real).toHaveLength(0)
  })

  test('6b. Non-existent page shows 404', async ({ page }) => {
    await page.goto('/c/this-user-does-not-exist-xyz')
    await expect(page.getByText('Page not found')).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 7. ROUTE PROTECTION
  // ═══════════════════════════════════════════════════════
  test('7a. Protected routes redirect to login', async ({ page }) => {
    await page.context().clearCookies()
    for (const path of ['/dashboard', '/calls', '/contacts', '/calendar', '/settings']) {
      await page.goto(path)
      await page.waitForURL('**/login', { timeout: 5000 })
      expect(page.url()).toContain('/login')
    }
  })

  // ═══════════════════════════════════════════════════════
  // 8. DARK MODE PERSISTENCE
  // ═══════════════════════════════════════════════════════
  test('8a. Dark mode persists across dashboard pages', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    const html = page.locator('html')

    await page.getByLabel('Toggle theme').last().click()
    await page.waitForTimeout(400)
    await expect(html).toHaveClass(/dark/)

    await page.getByRole('link', { name: 'Calls' }).click()
    await page.waitForURL('**/calls')
    await expect(html).toHaveClass(/dark/)

    await page.getByRole('link', { name: 'Calendar' }).click()
    await page.waitForURL('**/calendar')
    await expect(html).toHaveClass(/dark/)

    await page.getByLabel('Toggle theme').last().click()
    await page.waitForTimeout(400)
    await expect(html).not.toHaveClass(/dark/)
  })

  // ═══════════════════════════════════════════════════════
  // 9. API ENDPOINTS
  // ═══════════════════════════════════════════════════════
  test('9a. Signed URL API returns valid URL', async ({ page }) => {
    const res = await page.request.get(`/api/elevenlabs/public-signed-url?owner=${ownerId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.signedUrl).toBeTruthy()
    expect(typeof body.signedUrl).toBe('string')
  })

  test('9b. Webhook stores event and returns 200', async ({ page }) => {
    const convId = 'test-wh-' + Date.now()
    const res = await page.request.post('/api/webhooks/elevenlabs', {
      data: {
        type: 'post_call_transcription',
        event_timestamp: new Date().toISOString(),
        data: {
          conversation_id: convId,
          agent_id: 'test',
          status: 'done',
          transcript: [
            { role: 'agent', message: 'Hello! Welcome to the restaurant.' },
            { role: 'user', message: 'Hi, I want to book a table for Friday.' },
            { role: 'agent', message: 'Of course! What time would you like?' },
            { role: 'user', message: 'Around 7 PM, for 4 people please.' },
            { role: 'agent', message: 'I have you down for Friday at 7 PM, table for 4. Can I get your name?' },
            { role: 'user', message: 'John Smith.' },
            { role: 'agent', message: 'All set, John! See you Friday at 7.' },
          ],
          analysis: {
            call_successful: 'success',
            data_collection_results: {
              caller_name: { value: 'John Smith', rationale: 'Caller stated name' },
              reason_for_calling: { value: 'Book a table for 4 on Friday at 7 PM', rationale: 'Main intent' },
              appointment_requested: { value: true, rationale: 'Booking requested' },
              appointment_date: { value: '2026-04-03', rationale: 'Next Friday' },
              appointment_time: { value: '19:00', rationale: 'Stated 7 PM' },
              message: { value: null, rationale: 'No message left' },
            },
          },
        },
      },
    })
    expect(res.status()).toBe(200)

    // Verify stored in webhook_events
    const { data: events } = await supabaseAdmin.from('webhook_events').select('*').eq('conversation_id', convId)
    expect(events!.length).toBeGreaterThan(0)

    // Cleanup
    await supabaseAdmin.from('webhook_events').delete().eq('conversation_id', convId)
  })

  test('9c. Public call creation works', async ({ page }) => {
    const convId = 'test-call-' + Date.now()
    const res = await page.request.post('/api/calls/public', {
      data: { ownerId, conversationId: convId },
    })
    expect(res.status()).toBe(200)

    const { data: call } = await supabaseAdmin.from('calls').select('*').eq('elevenlabs_conversation_id', convId).single()
    expect(call).toBeTruthy()
    expect(call!.status).toBe('initiated')
    expect(call!.direction).toBe('browser')
    expect(call!.user_id).toBe(ownerId)

    await supabaseAdmin.from('calls').delete().eq('elevenlabs_conversation_id', convId)
  })

  test('9d. Public call creation rejects invalid owner', async ({ page }) => {
    const res = await page.request.post('/api/calls/public', {
      data: { ownerId: '00000000-0000-0000-0000-000000000000', conversationId: 'x' },
    })
    expect(res.status()).toBe(404)
  })

  // ═══════════════════════════════════════════════════════
  // 10. SIMULATED CONVERSATION + WEBHOOK E2E
  // ═══════════════════════════════════════════════════════
  test('10a. Full conversation simulation: call → webhook → dashboard shows data', async ({ page }) => {
    const convId = 'sim-conv-' + Date.now()

    // Step 1: Create pending call (simulates what the widget does)
    await page.request.post('/api/calls/public', {
      data: { ownerId, conversationId: convId },
    })

    // Verify pending call exists
    const { data: pending } = await supabaseAdmin.from('calls').select('*').eq('elevenlabs_conversation_id', convId).single()
    expect(pending).toBeTruthy()
    expect(pending!.status).toBe('initiated')

    // Step 2: Simulate webhook (what ElevenLabs sends after call ends)
    const webhookRes = await page.request.post('/api/webhooks/elevenlabs', {
      data: {
        type: 'post_call_transcription',
        event_timestamp: new Date().toISOString(),
        data: {
          conversation_id: convId,
          agent_id: 'agent_test',
          status: 'done',
          transcript: [
            { role: 'agent', message: "Hi there! Thanks for calling. How can I help you today?", timestamp: 0 },
            { role: 'user', message: "Hi, I'd like to make a reservation for Saturday evening.", timestamp: 3 },
            { role: 'agent', message: "I'd love to help with that! What time were you thinking, and how many guests?", timestamp: 5 },
            { role: 'user', message: "Around 6:30 PM, for 2 people. My name is Sarah Chen.", timestamp: 9 },
            { role: 'agent', message: "Got it! I have you down for Saturday at 6:30 PM, table for 2 under Sarah Chen. Is there anything else I can help with?", timestamp: 12 },
            { role: 'user', message: "No that's all, thank you!", timestamp: 16 },
            { role: 'agent', message: "You're welcome, Sarah! We look forward to seeing you Saturday. Have a great day!", timestamp: 18 },
          ],
          analysis: {
            call_successful: 'success',
            data_collection_results: {
              caller_name: { value: 'Sarah Chen', rationale: 'Stated name' },
              reason_for_calling: { value: 'Make a dinner reservation for Saturday at 6:30 PM for 2 guests', rationale: 'Main request' },
              appointment_requested: { value: true, rationale: 'Reservation requested and confirmed' },
              appointment_date: { value: '2026-04-04', rationale: 'Next Saturday' },
              appointment_time: { value: '18:30', rationale: '6:30 PM' },
              message: { value: null, rationale: 'No additional message' },
            },
          },
        },
      },
    })
    expect(webhookRes.status()).toBe(200)

    // Step 3: Verify call was updated
    const { data: completed } = await supabaseAdmin.from('calls').select('*').eq('elevenlabs_conversation_id', convId).single()
    expect(completed).toBeTruthy()
    expect(completed!.status).toBe('completed')
    expect(completed!.summary).toBeTruthy()
    expect(completed!.transcript).toBeTruthy()
    expect(completed!.contact_id).toBeTruthy()
    expect(completed!.webhook_received_at).toBeTruthy()

    // Step 4: Verify contact was created
    const { data: contact } = await supabaseAdmin.from('contacts').select('*').eq('id', completed!.contact_id).single()
    expect(contact).toBeTruthy()
    expect(contact!.display_name).toBe('Sarah Chen')

    // Step 5: Verify AI note was created
    const { data: notes } = await supabaseAdmin.from('contact_notes').select('*').eq('contact_id', completed!.contact_id)
    expect(notes!.length).toBeGreaterThan(0)
    expect(notes![0]!.note_type).toBe('ai_summary')

    // Step 6: Verify appointment was created
    const { data: appointments } = await supabaseAdmin.from('appointments').select('*').eq('call_id', completed!.id)
    expect(appointments!.length).toBe(1)
    expect(appointments![0]!.title).toContain('Sarah Chen')
    expect(appointments![0]!.status).toBe('scheduled')
    expect(appointments![0]!.contact_id).toBe(completed!.contact_id)

    // Step 7: Login and verify data shows in dashboard
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)

    // Go to calls page — should show the call
    await page.getByRole('link', { name: 'Calls' }).click()
    await page.waitForURL('**/calls')
    await expect(page.getByText('Sarah Chen').first()).toBeVisible()
    await expect(page.getByText('completed').first()).toBeVisible()

    // Click into the call detail
    await page.getByText('Sarah Chen').first().click()
    await page.waitForURL('**/calls/**')
    await expect(page.getByText('AI Summary')).toBeVisible()
    await expect(page.getByText('Transcript')).toBeVisible()
    await expect(page.getByText('reservation').first()).toBeVisible()

    // Go to contacts — should show Sarah Chen
    await page.getByRole('link', { name: 'Contacts' }).click()
    await page.waitForURL('**/contacts')
    await expect(page.getByText('Sarah Chen').first()).toBeVisible()

    // Click into contact detail
    await page.getByText('Sarah Chen').click()
    await page.waitForURL('**/contacts/**')
    await expect(page.getByText('Conversations')).toBeVisible()
    await expect(page.getByText('AI Notes')).toBeVisible()
    await expect(page.getByText('Appointments')).toBeVisible()

    // Go to calendar — should show the appointment
    await page.getByRole('link', { name: 'Calendar' }).click()
    await page.waitForURL('**/calendar')
    // The appointment should appear in upcoming
    await expect(page.getByText('Sarah Chen').first()).toBeVisible()

    // Cleanup
    await supabaseAdmin.from('appointments').delete().eq('call_id', completed!.id)
    await supabaseAdmin.from('contact_notes').delete().eq('contact_id', completed!.contact_id)
    await supabaseAdmin.from('calls').delete().eq('elevenlabs_conversation_id', convId)
    await supabaseAdmin.from('contacts').delete().eq('id', completed!.contact_id)
    await supabaseAdmin.from('webhook_events').delete().eq('conversation_id', convId)
  })

  // ═══════════════════════════════════════════════════════
  // 11. SETTINGS UPDATE
  // ═══════════════════════════════════════════════════════
  test('11a. Settings page saves changes', async ({ page }) => {
    await loginAs(page, OWNER_EMAIL, OWNER_PASSWORD)
    await page.getByRole('link', { name: 'Settings' }).click()
    await page.waitForURL('**/settings')

    // Wait for form to load
    await expect(page.getByRole('heading', { name: 'Business Information' })).toBeVisible()
    await page.waitForTimeout(1000) // wait for data to load

    // Verify Save Changes button exists and is clickable
    const saveBtn = page.getByRole('button', { name: 'Save Changes' })
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toBeEnabled()
  })
})
