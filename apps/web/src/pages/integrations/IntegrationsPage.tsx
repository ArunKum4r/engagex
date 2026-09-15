import {
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    integrations,
    type IntegrationDefinition,
} from "../integrations/integrations";

const IntegrationsPage = () => {
    const navigate = useNavigate();

    const channelIntegrations = integrations.filter(
        (integration) =>
            integration.category === "CHANNEL",
    );

    const crmIntegrations = integrations.filter(
        (integration) =>
            integration.category === "CRM",
    );

    const accountingIntegrations =
        integrations.filter(
            (integration) =>
                integration.category ===
                "ACCOUNTING",
        );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Integrations
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Connect the platforms and services you
                    use with EngageX.
                </p>
            </div>

            {/* Channels */}
            <IntegrationSection
                title="Channels"
                description="Connect your social platforms to automate engagement."
                integrations={channelIntegrations}
                onSelect={(integration) =>
                    navigate(
                        `/integrations/${integration.slug}`,
                    )
                }
            />

            {/* CRM */}
            <IntegrationSection
                title="CRM"
                description="Connect your customer management tools."
                integrations={crmIntegrations}
                onSelect={(integration) =>
                    navigate(
                        `/integrations/${integration.slug}`,
                    )
                }
            />

            {/* Accounting */}
            <IntegrationSection
                title="Accounting"
                description="Connect your accounting and financial services."
                integrations={accountingIntegrations}
                onSelect={(integration) =>
                    navigate(
                        `/integrations/${integration.slug}`,
                    )
                }
            />
        </div>
    );
};

interface IntegrationSectionProps {
    title: string;
    description: string;
    integrations: IntegrationDefinition[];
    onSelect: (
        integration: IntegrationDefinition,
    ) => void;
}

const IntegrationSection = ({
    title,
    description,
    integrations,
    onSelect,
}: IntegrationSectionProps) => {
    if (integrations.length === 0) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="space-y-3">
                {integrations.map((integration) => (
                    <IntegrationCard
                        key={integration.slug}
                        integration={integration}
                        onClick={() =>
                            onSelect(integration)
                        }
                    />
                ))}
            </div>
        </section>
    );
};

interface IntegrationCardProps {
    integration: IntegrationDefinition;
    onClick: () => void;
}

const IntegrationCard = ({
    integration,
    onClick,
}: IntegrationCardProps) => {
    const isAvailable =
        integration.status === "AVAILABLE";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isAvailable}
            className={`group flex w-full items-center justify-between rounded-xl border bg-card p-5 text-left transition-colors ${
                isAvailable
                    ? "cursor-pointer hover:bg-muted/40"
                    : "cursor-default opacity-75"
            }`}
        >
            <div className="flex items-center gap-4">
                <IntegrationIcon
                    integration={integration}
                />

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                            {integration.name}
                        </h3>

                        {!isAvailable && (
                            <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                Coming soon
                            </span>
                        )}
                    </div>

                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {integration.description}
                    </p>
                </div>
            </div>

            {isAvailable && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            )}
        </button>
    );
};

interface IntegrationIconProps {
    integration: IntegrationDefinition;
}

const IntegrationIcon = ({
    integration,
}: IntegrationIconProps) => {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-background">
            <span className="text-sm font-semibold">
                {integration.slug === "instagram"
                    ? "IG"
                    : integration.name.charAt(0)}
            </span>
        </div>
    );
};

export default IntegrationsPage;