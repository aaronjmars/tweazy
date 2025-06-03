# Tambo MCP Template

This is a starter NextJS app with tambo-ai for generative UI and MCP.

[![Watch the tutorial here](https://img.youtube.com/vi/6zDDPfr7Aoo/0.jpg)](https://youtu.be/6zDDPfr7Aoo)

## Get Started

1. Run `npm create-tambo@latest my-tambo-app` for a new project

2. `npm install`

3. `npx tambo init`

- or rename `example.env.local` to `.env.local` and add your tambo API key you can get for free [here](https://tambo.co/dashboard).

4. Run `npm run dev` and go to `localhost:3000` to use the app!

### Configure Model Context Protocol (MCP) Servers

You can go to https://localhost:3000/mcp-config to add MCP servers.

For the demo above we used smithery.ai's [brave-search-mcp](https://smithery.ai/server/@mikechao/brave-search-mcp)

![brave-search-mcp](./brave-search-mcp.png)

You can use any MCP compatible server that supports SSE or HTTP.

Our MCP config page is built using the tambo-ai/react/mcp package:

```tsx
// In your chat page
<TamboProvider
  apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
  components={components}
>
  <TamboMcpProvider mcpServers={mcpServers}>
    <MessageThreadFull contextKey="tambo-template" />
  </TamboMcpProvider>
</TamboProvider>
```

In this example, MCP servers are stored in browser localStorage and loaded when the application starts.

You could have these servers be stored in a database or fetched from an API.

For more detailed documentation, visit [Tambo's official docs](https://tambo.co/docs).

## Customizing

### Change what components tambo can control

You can see how the `Graph` component is registered with tambo in `src/lib/tambo.ts`:

```tsx
const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema, // zod schema for the component props
  },
  // Add more components
];
```

You can find more information about the options [here](https://tambo.co/docs/concepts/registering-components)
