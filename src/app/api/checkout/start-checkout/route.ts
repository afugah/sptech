import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';
import { getClientIpAddress } from '@/src/lib/security/ipValidation';
import { createValidationErrorResponse, validateRequestBody } from '@/src/lib/validation/middleware';

// Validation schema for checkout start request - matches what the client sends
const checkoutStartSchema = z.object({
  shippingProvider: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  paymentProvider: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  giftCardProvider: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  voucherProvider: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});

// Function to check if checkout should be allowed based on validateStock properties
async function shouldAllowCheckoutDespiteStockError(cartToken: string): Promise<boolean> {
  try {
    // Get the current cart session to access cart items
    const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_BRINK_API_URL}/sessions/${cartToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'BrinkCommerceDefaultApiKey',
      },
    });

    if (!cartResponse.ok) {
      return false;
    }

    const cartSession = await cartResponse.json();
    const cartItems = cartSession.cart?.items || [];

    if (cartItems.length === 0) {
      return false;
    }

    // Check each cart item to see if out-of-stock items have validateStock: false
    const commerceService = di.resolve(CommerceService);

    const stockChecks = await Promise.all(
      cartItems.map(
        async (item: {
          productParentId: string;
          productVariantId: string;
          customAttributes?: { validateStock?: string };
        }) => {
          try {
            // Check if validateStock is in custom attributes first
            const validateStockFromItem = item.customAttributes?.validateStock;
            const itemValidateStock =
              validateStockFromItem === 'false' ? false : validateStockFromItem === 'true' ? true : undefined;

            // Get stock information
            const stockData = await commerceService.getStock(item.productParentId, 'SE');
            const variantStock = stockData.find((stock) => stock.id === item.productVariantId);

            if (!variantStock) return { shouldBlock: false };

            const totalStock = variantStock.inventories.reduce((sum, inv) => sum + inv.quantity, 0);

            // Priority order for validateStock:
            // 1. Cart item custom attributes
            // 2. Stock response (if available)
            // 3. Default to true (current behavior)
            const validateStockValue = itemValidateStock ?? variantStock.validateStock ?? true;
            const shouldBlock = totalStock === 0 && validateStockValue;

            return { shouldBlock, stock: totalStock, validateStock: validateStockValue };
          } catch (error) {
            console.error(`Error checking stock for item ${item.productVariantId}:`, error);
            // If we can't check stock, assume it should block to be safe
            return { shouldBlock: true };
          }
        },
      ),
    );

    // Only allow checkout if NO items should block it
    const hasBlockingItems = stockChecks.some((check) => check.shouldBlock);

    return !hasBlockingItems;
  } catch (error) {
    console.error('Error in checkout stock validation:', error);
    // If validation fails, don't allow checkout to be safe
    return false;
  }
}

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';

  const headersList = await headers();
  const authorization = headersList.get('authorization');

  // Validate request body
  const validation = await validateRequestBody(req, checkoutStartSchema);
  if (!validation.success) {
    return createValidationErrorResponse(validation);
  }

  try {
    const clientIp = getClientIpAddress(req);
    const body = validation.data;
    const result = await fetch(`${baseUrl}/sessions/checkout/start`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });

    const session = await result.json();

    // If Brink API returns out of stock error, check if we should allow checkout anyway
    if (session.error === 'out of stock error' || (session.error && session.error.includes('out of stock'))) {
      // Extract cart token from authorization header
      const cartToken = authorization?.replace('Bearer ', '') || '';

      if (cartToken) {
        const shouldAllow = await shouldAllowCheckoutDespiteStockError(cartToken);

        if (shouldAllow) {
          // Return success response for items with validateStock: false
          return NextResponse.json({
            message: 'Checkout allowed with out-of-stock items that have validateStock: false',
            allowedDespiteStock: true,
            originalError: session.error,
            token: cartToken,
          });
        } else {
          return NextResponse.json(session);
        }
      } else {
        return NextResponse.json(session);
      }
    }

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
