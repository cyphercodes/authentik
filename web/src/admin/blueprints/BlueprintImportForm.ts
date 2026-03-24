import "#components/ak-status-label";
import "#elements/events/LogViewer";
import "#elements/forms/HorizontalFormElement";

import { DEFAULT_CONFIG } from "#common/api/config";
import { docLink } from "#common/global";
import { SentryIgnoredError } from "#common/sentry/index";

import { Form } from "#elements/forms/Form";

import { AKLabel } from "#components/ak-label";

import { BlueprintImportResult, Flow, ManagedApi } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";

@customElement("ak-blueprint-import-form")
export class BlueprintImportForm extends Form<Flow> {
    static styles: CSSResult[] = [...super.styles, PFDescriptionList];

    @state()
    protected result: BlueprintImportResult | null = null;

    public override reset(): void {
        super.reset();

        this.result = null;
    }

    getSuccessMessage(): string {
        return msg("Successfully imported blueprint.");
    }

    async send(): Promise<BlueprintImportResult> {
        const file = this.files().get("blueprint");
        if (!file) {
            throw new SentryIgnoredError("No form data");
        }
        const result = await new ManagedApi(DEFAULT_CONFIG).managedBlueprintsImportCreate({
            file: file,
        });
        if (!result.success) {
            this.result = result;
            throw new SentryIgnoredError("Failed to import blueprint");
        }
        return result;
    }

    renderResult(): TemplateResult {
        return html`
            <ak-form-element-horizontal label=${msg("Successful")}>
                <div class="pf-c-form__group-label">
                    <div class="c-form__horizontal-group">
                        <span class="pf-c-form__label-text">
                            <ak-status-label ?good=${this.result?.success}></ak-status-label>
                        </span>
                    </div>
                </div>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${msg("Log messages")}>
                <div class="pf-c-form__group-label">
                    <div class="c-form__horizontal-group">
                        <dl class="pf-c-description-list pf-m-horizontal">
                            <ak-log-viewer .logs=${this.result?.logs}></ak-log-viewer>
                        </dl>
                    </div>
                </div>
            </ak-form-element-horizontal>
        `;
    }

    protected override renderForm(): TemplateResult {
        return html`<ak-form-element-horizontal name="blueprint">
                ${AKLabel(
                    {
                        slot: "label",
                        className: "pf-c-form__group-label",
                        htmlFor: "blueprint",
                    },
                    msg("Blueprint"),
                )}

                <input
                    type="file"
                    value=""
                    class="pf-c-form-control"
                    id="blueprint"
                    name="blueprint"
                    aria-describedby="blueprint-help"
                />

                <div id="blueprint-help">
                    <p class="pf-c-form__helper-text">
                        ${msg(".yaml files, which can be found in the Example Flows documentation")}
                    </p>
                    <p class="pf-c-form__helper-text">
                        ${msg("Read more about")}&nbsp;
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href=${docLink("/add-secure-apps/flows-stages/flow/examples/flows/")}
                            >${msg("Flow Examples")}</a
                        >
                    </p>
                </div>
            </ak-form-element-horizontal>
            ${this.result ? this.renderResult() : nothing}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-blueprint-import-form": BlueprintImportForm;
    }
}
