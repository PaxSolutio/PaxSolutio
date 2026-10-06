import {
    NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const clientId =
        process.env.PAYPAL_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            {
                success: false,
                error:
                    "Configuration PayPal indisponible.",
            },
            {
                status: 500,
            }
        );
    }

    return NextResponse.json({
        success: true,

        client_id:
            clientId,

        environment:
            process.env.PAYPAL_ENV ||
            "sandbox",
    });
}