import {
    NextRequest,
    NextResponse,
} from "next/server";

import { randomUUID } from "crypto";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

const MAX_FILE_SIZE =
    8 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

export async function POST(
    request: NextRequest
) {
    try {
        const formData =
            await request.formData();

        const file =
            formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune image reçue.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !ALLOWED_TYPES.includes(
                file.type
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Format non autorisé. Utilisez JPG, PNG, WEBP ou AVIF.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "L'image dépasse 8 Mo.",
                },
                {
                    status: 400,
                }
            );
        }

        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase() ||
            "jpg";

        const fileName =
            `${Date.now()}-${randomUUID()}.${extension}`;

        const filePath =
            `offers/${fileName}`;

        const buffer =
            Buffer.from(
                await file.arrayBuffer()
            );

        const supabase =
            createServerSupabaseClient();

        const {
            error: uploadError,
        } = await supabase.storage
            .from("offer-media")
            .upload(
                filePath,
                buffer,
                {
                    contentType:
                        file.type,
                    upsert: false,
                }
            );

        if (uploadError) {
            throw uploadError;
        }

        const {
            data: publicUrlData,
        } = supabase.storage
            .from("offer-media")
            .getPublicUrl(
                filePath
            );

        return NextResponse.json({
            success: true,
            url:
                publicUrlData.publicUrl,
            path: filePath,
        });
    } catch (error) {
        console.error(
            "Erreur upload offre :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible d'envoyer l'image.",
            },
            {
                status: 500,
            }
        );
    }
}