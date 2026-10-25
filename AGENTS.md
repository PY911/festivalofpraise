<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Festival Q&A uses server-only AI Gateway Responses calls grounded in the current event and merchandise configuration, never customer orders, so answers track visible site information.
- Chat threads use route-derived IDs and browser-local UIMessage history; chat content is not saved in the database.
- AI access denials are persisted in a service-only safety-state table to prevent repeated blocked calls across restarts.
- Keep the AI SDK core and its provider adapters on compatible provider-type versions; pin adapters when newer type contracts diverge.
