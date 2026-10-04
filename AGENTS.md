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

- Flash-sale festival decorations are controlled by theme booleans in `flash_sale_settings`; Christmas takes visual priority when multiple themes are enabled.
- Flash-sale order keys normalize to their regular base plan keys before stock lookup, so one inventory pool serves regular and sale orders.
