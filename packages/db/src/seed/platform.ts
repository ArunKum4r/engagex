import { db } from "../client.js";
import { platforms } from "../schema/platforms.js";

const seedPlatforms = async () => {
    const platformData = [
        {
            key: "INSTAGRAM",
            name: "Instagram",
        },
        {
            key: "FACEBOOK",
            name: "Facebook",
        },
        {
            key: "WHATSAPP",
            name: "WhatsApp",
        },
    ];

    for (const platform of platformData) {
        await db
            .insert(platforms)
            .values(platform)
            .onConflictDoNothing({
                target: platforms.key,
            });
    }

    console.log("Platforms seeded successfully");
};

seedPlatforms()
    .catch((error) => {
        console.error("Failed to seed platforms:", error);
        process.exit(1);
    })
    .finally(async () => {
        process.exit(0);
    });