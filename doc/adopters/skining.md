---
---

# Skining. Change the paella look and feel


Paella player uses the main [config file](configure.md) for define the skin to use:

``` javascript
"skin": {
        "default": "dark",
        "available": [
            "dark",
            "dark_small",
            "light",
            "light_small"
        ]
    }
```

But for making new changes to your local project you must edit the config.json under `/build/player/config` directory.


## How it works ?

Paella's config defines a skin to use and this has a pack of icons and colors preconfigured to use. 

## How can i change it ?

You can test your skins in live mode using:

```javascript
paella.player.config.skin.available; // RETURNS ["dark", "dark_small", "light", "light_small"]

paella.utils.skin.set("light")
```

This is code from the themechoose plugin.

### Colors

Under [`/resources/style/skins`](https://github.com/polimediaupv/paella/tree/6.0.x/resources/style/skins) you have all `*.less` files for change the colors of the current installed skins. 

If you want to create new one, just make a new ".less" with the name of your skin.

### Icons

The icons used in the navigation bar and other elements, are generated using a customized text font, and defined in the file `resources/style/icons.css`. You can view the available icons and the CSS class to use them opening the HTML file `resources/style/icon-index.html` in the [paella repository](https://github.com/polimediaupv/paella)

Example:

```html
 <div>
    <span class="icon-photo"></span>
    <span>icon-photo</span>
</div>
```

 ![](icon-photo-sample.jpg)
