# Skining. Change the paella look and feel


Paella player uses the main [config file](configure.md) for define the skin to use:

````javascript
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

###Colors

Under [`/resources/style/skins`](../../resources/style/skins) you have all `*.less` files for change the colors of the current installed skins. 

If you want to create new one, just make a new ".less" with the name of your skin.

### Icons

Icons used for the skins are located at /resources/images

 ![](../../resources/images/paella_icons_dark.png)

We use one image with all icons for precharge all icons at same time and we use them using css (`background-image` and `background-size`), the icons are made for high resolution screens.
