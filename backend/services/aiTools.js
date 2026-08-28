import { searchProducts, getSizeAvailability } from "./productService.js";
import { getOrdersByUser, getOrderById } from "./orderService.js";

const STORE_POLICY = {
  delivery: {
    standard: "5-7 business days for in-stock items",
    express: "2-3 business days (available at checkout for an extra fee)",
    note: "Delivery timelines may extend by 1-2 days during peak admission season (April-June).",
  },
  returns: {
    window: "7 days from date of delivery",
    condition: "Item must be unused, with original tags attached",
    process:
      "1) Go to 'My Orders' and select the order. 2) Click 'Request Exchange/Return' on the item. 3) Choose a reason and preferred replacement size. 4) Our team schedules a pickup within 2 business days. 5) Replacement is shipped once the returned item passes quality check, or a refund is issued to the original payment method.",
    nonReturnable: "Items marked 'Final Sale' and washed/worn items cannot be returned.",
  },
};

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the uniform product catalog by school, grade, category, color, or gender. Use this for questions like 'do you have white shirts for grade 7' or 'what pants are available'.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free text search term, e.g. product name keywords" },
          schoolName: { type: "string", description: "Name of the school, if mentioned" },
          grade: { type: "string", description: "e.g. 'Grade 7'" },
          category: { type: "string", description: "e.g. Shirt, Pants, Skirt, Tie, Blazer, Shoes" },
          color: { type: "string" },
          gender: { type: "string", enum: ["Boys", "Girls", "Unisex"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_size_availability",
      description: "Get available sizes and stock for a specific product by its product ID.",
      parameters: {
        type: "object",
        properties: { productId: { type: "string", description: "MongoDB product ID" } },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description:
        "Get the current authenticated user's order history. Use this for 'where is my order', 'my recent orders', or order status questions. Only works if the user is logged in.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_by_id",
      description: "Get details and status of a specific order by its order ID, for the current authenticated user.",
      parameters: {
        type: "object",
        properties: { orderId: { type: "string" } },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_delivery_info",
      description: "Get the store's delivery timelines and shipping policy.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_return_policy",
      description: "Get the store's return/exchange policy and process for a question about returns or exchanges.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export const executeTool = async (name, args, userId) => {
  switch (name) {
    case "search_products": {
      const products = await searchProducts({
        query: args.query,
        schoolName: args.schoolName,
        grade: args.grade,
        category: args.category,
        color: args.color,
        gender: args.gender,
        limit: 8,
      });
      return products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        color: p.color,
        gender: p.gender,
        price: p.price,
        school: p.school?.name,
        applicableGrades: p.applicableGrades,
        sizes: p.sizes.map((s) => ({ size: s.size, inStock: s.stock > 0 })),
      }));
    }

    case "get_size_availability": {
      const sizes = await getSizeAvailability(args.productId);
      if (!sizes) return { error: "Product not found" };
      return sizes;
    }

    case "get_my_orders": {
      if (!userId) return { error: "User is not logged in. Ask them to log in to check order status." };
      const orders = await getOrdersByUser(userId);
      return orders.slice(0, 5).map((o) => ({
        orderId: o._id,
        status: o.status,
        totalAmount: o.totalAmount,
        items: o.items.map((i) => `${i.name} (size ${i.size}) x${i.quantity}`),
        placedOn: o.createdAt,
        estimatedDelivery: o.estimatedDelivery,
      }));
    }

    case "get_order_by_id": {
      if (!userId) return { error: "User is not logged in." };
      const order = await getOrderById(args.orderId, userId);
      if (!order) return { error: "Order not found for this user." };
      return {
        orderId: order._id,
        status: order.status,
        statusHistory: order.statusHistory,
        items: order.items.map((i) => `${i.name} (size ${i.size}) x${i.quantity}`),
        estimatedDelivery: order.estimatedDelivery,
      };
    }

    case "get_delivery_info":
      return STORE_POLICY.delivery;

    case "get_return_policy":
      return STORE_POLICY.returns;

    default:
      return { error: `Unknown tool: ${name}` };
  }
};