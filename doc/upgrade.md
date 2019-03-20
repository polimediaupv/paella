---
---

# Upgrading from paella 6.0.x to 6.1.x

*Breaking changes*: 

- The index.html file now includes `paella_player_es2015.js`. If you plan to support
  Internet Explorer, you will need to modify the `index.html` file to add the legacy scripts.
- The button plugins now must implement the method `getAriaLabel()` to be included in the
  tabindex. if you have a plugin that is relevant for screen readers, you must implement
  this function in your plugin.
