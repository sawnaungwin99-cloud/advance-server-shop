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

- Flash-sale festival decorations use persistent independent theme booleans in `flash_sale_settings`; Christmas only takes priority over Thadingyut, while Summer and Rainy layers combine at reduced intensity.
- Flash-sale order keys normalize to their regular base plan keys before stock lookup, so one inventory pool serves regular and sale orders.
- Storefront sales badges use the public completed-sales aggregate, normalize sale keys to base packages, and poll it for guest-safe updates; never fetch private order rows for badges.
