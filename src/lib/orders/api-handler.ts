/**
 * WebCraftly Order & Admin API Request Handler
 */

import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
  confirmProject,
  recordOrderPayment,
  getCatalogFromDb,
  getAdminCustomers,
} from "./index.ts";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(error: unknown) {
  const err = error as { status?: number; message?: string };
  const status = typeof err.status === "number" ? err.status : 400;
  return new Response(
    JSON.stringify({
      error: err.message || "An unexpected error occurred.",
    }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    }
  );
}

export async function handleOrderApiRequest(request: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;
  const method = request.method;

  try {
    // 0. Public Catalog: Real Neon Database Data
    if (pathname === "/api/catalog" && method === "GET") {
      const catalog = await getCatalogFromDb();
      return jsonResponse({ services: catalog }, 200);
    }

    // 1. Customer: Create Order
    if (pathname === "/api/orders" && method === "POST") {
      const body = await request.json();
      const result = await createOrder(request, body);
      return jsonResponse(result, 201);
    }

    // 2. Customer: Get Own Orders
    if (pathname === "/api/orders" && method === "GET") {
      const orders = await getCustomerOrders(request);
      return jsonResponse({ orders }, 200);
    }

    // 3. Customer or Admin: Get Order by ID
    const orderMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9_-]+)$/);
    if (orderMatch && method === "GET") {
      const orderId = orderMatch[1]!;
      const result = await getOrderById(request, orderId);
      return jsonResponse(result, 200);
    }

    // 4. Admin: List All Orders
    if (pathname === "/api/admin/orders" && method === "GET") {
      const status = url.searchParams.get("status");
      const paymentStatus = url.searchParams.get("paymentStatus");
      const search = url.searchParams.get("search");
      const filterObj: { status?: string; paymentStatus?: string; search?: string } = {};
      if (status) filterObj.status = status;
      if (paymentStatus) filterObj.paymentStatus = paymentStatus;
      if (search) filterObj.search = search;
      const orders = await getAdminOrders(request, filterObj);
      return jsonResponse({ orders }, 200);
    }

    // 4b. Admin: List All Customers
    if (pathname === "/api/admin/customers" && method === "GET") {
      const customers = await getAdminCustomers(request);
      return jsonResponse({ customers }, 200);
    }

    // 5. Admin: Update Order Status
    const statusMatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9_-]+)\/status$/);
    if (statusMatch && method === "PATCH") {
      const orderId = statusMatch[1]!;
      const body = await request.json();
      const updated = await updateOrderStatus(request, orderId, body);
      return jsonResponse({ order: updated }, 200);
    }

    // 6. Admin: Explicit Project Confirmation
    const confirmMatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9_-]+)\/confirm$/);
    if (confirmMatch && method === "POST") {
      const orderId = confirmMatch[1]!;
      let body: { notes?: string } = {};
      try {
        body = await request.json();
      } catch {}
      const confirmed = await confirmProject(request, orderId, body?.notes);
      return jsonResponse({ order: confirmed }, 200);
    }

    // 7. Admin: Record Manual Payment
    const paymentMatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9_-]+)\/payments$/);
    if (paymentMatch && method === "POST") {
      const orderId = paymentMatch[1]!;
      const body = await request.json();
      const result = await recordOrderPayment(request, orderId, body);
      return jsonResponse(result, 201);
    }

    return null;
  } catch (error) {
    return errorResponse(error);
  }
}
