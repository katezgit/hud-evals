import { envTemplates } from "../../_data/templates";
import { TemplateCard } from "./template-card";

export function TemplatesSection() {
  return (
    <section aria-labelledby="templates-heading" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2
          id="templates-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          Start from a template on GitHub
        </h2>
        <p className="text-label text-muted-foreground">
          Fork or clone any of these to get a working HUD environment in
          seconds.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {envTemplates.map((template) => (
          <li key={template.id}>
            <TemplateCard template={template} />
          </li>
        ))}
      </ul>
    </section>
  );
}
