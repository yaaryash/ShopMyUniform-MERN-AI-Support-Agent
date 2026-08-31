# ShopMyUniform — MERN E-Commerce + AI Customer Support Agent


## Live Demo
- **Frontend (live app):** https://shop-my-uniform-mern-ai-support-age.vercel.app/
- **Backend API:** https://shopmyuniform-backend.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. If the site feels slow or the AI chat widget doesn't respond immediately on first load, the backend is waking up — this can take 10-30 seconds. Subsequent requests will be fast.


## Project Overview

ShopMyUniform is a full-stack school uniform e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It includes user registration, school/grade-based product browsing, shopping cart, checkout, order tracking, and an AI-powered customer support chat widget embedded on every page.

The AI assistant answers questions about products, sizes, delivery, orders, and returns by retrieving real data from the application's own MongoDB database via function calling — not from general LLM knowledge.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas), Mongoose ODM |
| AI | Groq API (`openai/gpt-oss-120b`), via the OpenAI-compatible SDK, using function/tool calling |
| Auth | JWT + bcrypt password hashing |

## Database Structure

**School**
`name, city, grades[]`

**User**
`name, email, password (hashed), role (parent/student), studentName, grade, school (ref → School), phone, address`

**Product**
`name, description, category, color, gender, school (ref → School), applicableGrades[], price, images[], sizes[{size, stock}], isActive`
— stock is tracked per size, which is what lets both the storefront and the AI answer size-availability questions accurately.

**Order**
`user (ref → User), items[{product (ref), name, size, quantity, price}], totalAmount, shippingAddress, status, statusHistory[{status, date, note}], estimatedDelivery, paymentMethod`
— `items` snapshot the product name/price at time of purchase, so later price changes don't rewrite order history. `statusHistory` powers the tracking timeline and the AI's "where is my order" answers.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get logged-in user's profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/schools` | — | List all schools |
| GET | `/api/schools/:id` | — | Get one school |
| GET | `/api/products` | — | Search/filter products (`query, school, grade, category, color, gender, minPrice, maxPrice`) |
| GET | `/api/products/:id` | — | Product details |
| POST | `/api/products` | — | Create a product (used for seeding/demo data; no admin role built for this assignment's scope) |
| POST | `/api/orders` | ✅ | Place an order from cart items — price and stock are recomputed/validated server-side |
| GET | `/api/orders/my` | ✅ | List logged-in user's orders |
| GET | `/api/orders/:id` | ✅ | Order details + tracking history |
| POST | `/api/ai/chat` | optional | AI chat — works for guests (product/delivery/return questions) and logged-in users (adds order questions) |

## AI Architecture & Integration Approach

**Pattern:** function calling (tool use), not RAG/vector search.

The assignment's own data flow diagram — *User Question → AI Agent → Retrieve Relevant Data → Backend API/MongoDB → AI Generates Response → User* — describes structured retrieval, not semantic/vector search. Since products and orders are structured data with exact fields (category, grade, stock, status), precise database queries triggered by the LLM are more accurate than embedding-based similarity search, which is built for unstructured text. Function calling *is* a form of retrieval-augmented generation — just structured retrieval instead of vector retrieval.

**Flow:**
1. The user's message, prior conversation history, and 6 tool definitions are sent to the LLM:
   `search_products`, `get_size_availability`, `get_my_orders`, `get_order_by_id`, `get_delivery_info`, `get_return_policy`.
2. The model decides for itself — with no if/else scripting — whether it needs data at all, and which tool(s) to call with which arguments.
3. The chosen tool executes against `services/productService.js` / `services/orderService.js` — the exact same functions the REST API uses, so the AI never sees data that differs from what the storefront shows.
4. The tool's real result is fed back into the conversation, and the model writes its final answer grounded in that data. The loop supports up to 4 rounds so the model can chain multiple lookups if a question needs it.

**Guardrails:**
- Order-lookup tools are always scoped to the authenticated user's ID from the JWT — passed in from `req.user`, never from the model or the message text — so the AI cannot be prompted into retrieving another user's order data.
- The system prompt instructs the model to always attempt an order-related tool call rather than assume the user is logged out.
- The model is instructed never to invent stock, prices, or order status, and to ask a clarifying question (e.g. which school) when a product question is ambiguous.
- Model replies are sanitized server-side (`stripMarkdown` in `aiService.js`): LLM markdown output (bold, tables) doesn't render in a plain-text chat widget, and prompt instructions alone weren't fully reliable, so plain-text formatting is also enforced in code as a safety net.

**Tested and confirmed working**, covering all 5 example questions from the assignment brief:
- **Products** — "Do you have white shirts for Grade 7?"
- **Sizes** — accurate in-stock/out-of-stock sizes per product
- **Delivery** — store delivery timelines
- **Orders** — "Where is my order?", scoped to the logged-in user's real order data
- **Returns/Exchanges** — "I want to exchange my shirt, what's the process?"

## Environment Variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
GROQ_API_KEY=your_groq_api_key
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

> Real credentials are never committed — only `.env.example` files with placeholders are in the repo. Actual values are set locally or in the hosting platform's environment variable settings when deployed.

## Setup Instructions & Running Locally

Both servers must run **simultaneously**, in two separate terminals.

**1. Backend**
```bash
cd backend
npm install
# create backend/.env using the variables listed above
npm run seed      # populates 1 school + 5 sample products
npm run dev        # starts on http://localhost:5000
```

**2. Frontend** (new terminal)
```bash
cd frontend
npm install
# create frontend/.env using the variable listed above
npm run dev        # starts on http://localhost:5173
```

**3. Try it**
- Register an account, select a school, browse the catalog, add an item to your cart, and check out.
- Open the chat widget (bottom-right, on any page) and try:
  - *"Do you have white shirts for Grade 7?"*
  - *"What sizes are available for the navy trousers?"*
  - *"How long will delivery take?"*
  - *"Where is my order?"* (while logged in)
  - *"I want to exchange my shirt, what's the process?"*

## Known Simplifications

Given the assignment's own scope note (*"you do not need to build a production-level e-commerce platform"*), the following were deliberately kept simple:

- **No admin panel or role** — products are added via the seed script or a direct API call, not an admin UI.
- **No real payment gateway** — checkout captures a payment method selection (COD/UPI/Card) but does not process an actual transaction.
- **Cart is client-side** (React Context + localStorage), not its own MongoDB collection — it becomes a real, persisted `Order` document only at checkout, with price and stock re-validated against the database at that point.
- **Return/exchange requests are explained, not filed** — the AI answers the policy and process (matching the assignment's example question directly) but there's no separate workflow/collection to submit and track an actual return request.

## Status

- [x] Backend — models, auth, schools, products, orders, and AI agent all built and tested end to end
- [x] Frontend — all required pages (registration, profile, school selection, catalog, product details, search, cart, checkout, order creation, my orders, order details) built and tested against the live backend
- [x] AI chat widget — floating on every page, verified against real product and order data
- [x] Styling applied across the full application
- [x] Deployed — backend on Render, frontend on Vercel, both confirmed working end to end including live AI chat against real data
- [x] Input validation (express-validator) on auth and order endpoints, rate limiting on AI chat endpoint



