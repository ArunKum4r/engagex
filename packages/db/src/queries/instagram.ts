export function validateInstagramPlatformAccount(
    account: {
        platform: string;
        credentials: unknown;
        metadata: unknown;
    },
) {
    const errors: string[] = [];

    if (account.platform !== "INSTAGRAM") {
        errors.push(
            "Connected platform account is not an Instagram account.",
        );

        return errors;
    }

    if (
        !account.credentials ||
        typeof account.credentials !== "object" ||
        Array.isArray(account.credentials)
    ) {
        errors.push(
            "Instagram account credentials are missing.",
        );
    } else {
        const credentials =
            account.credentials as Record<
                string,
                unknown
            >;

        if (
            typeof credentials.accessToken !==
                "string" ||
            credentials.accessToken.length === 0
        ) {
            errors.push(
                "Instagram access token is missing.",
            );
        }

        if (
            typeof credentials.obtainedAt !==
                "string" ||
            credentials.obtainedAt.length === 0
        ) {
            errors.push(
                "Instagram token timestamp is missing.",
            );
        }

        if (
            typeof credentials.expiresIn ===
                "number" &&
            typeof credentials.obtainedAt ===
                "string"
        ) {
            const obtainedAt =
                new Date(
                    credentials.obtainedAt,
                );

            if (
                Number.isNaN(
                    obtainedAt.getTime(),
                )
            ) {
                errors.push(
                    "Instagram token timestamp is invalid.",
                );
            } else {
                const expiresAt =
                    obtainedAt.getTime() +
                    credentials.expiresIn *
                        1000;

                if (
                    Date.now() >=
                    expiresAt
                ) {
                    errors.push(
                        "Instagram access token has expired.",
                    );
                }
            }
        }
    }

    if (
        !account.metadata ||
        typeof account.metadata !== "object" ||
        Array.isArray(account.metadata)
    ) {
        errors.push(
            "Instagram account metadata is missing.",
        );
    } else {
        const metadata =
            account.metadata as Record<
                string,
                unknown
            >;

        if (
            typeof metadata.instagramAppScopedId !==
                "string" ||
            metadata.instagramAppScopedId.length ===
                0
        ) {
            errors.push(
                "Instagram app-scoped account ID is missing.",
            );
        }
    }

    return errors;
}