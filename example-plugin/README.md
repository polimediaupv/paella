# Paella Player example

Do not attempt to run this example from its original location. To run this example, copy the folder next to the Paella Player repository directory:

```fs
root
    |- paella       // Paella Player repository
    |- paella-example      < Paella Player example
    |- paella-example-plugin < this plugin folder
```

```sh
cd [paella-player-repository]
cp -r example ../paella-example
cp -r example-plugin ../paella-example-plugin
cd ../paella-example-plugin
npm instal
npm run build
cd ../paella-example
npm install
npm run dev
```

Then open the following URL in a browser:

[http://localhost:8080/?id=belmar-multiresolution-remote](http://localhost:8080/?id=belmar-multiresolution-remote)


