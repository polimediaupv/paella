---
---

# Integrate Paella in your portal: the basic way

To add Paella Player to your portal, you need to do some easy steps:

1. Download a prebuilt version of Paella
  You may get it from the [github releases page](https://github.com/polimediaupv/paella/releases) 

2. Copy the paella player folder to your web server
  You need to copy the `player` folder to your portal webserver and make it visible at any URL.
  If you want to use the test data provided with paella, then you need to capy also the repository folder.

3. Test
  If you have copied the repository folder, `http://<your_server_name>/<your_document_root>/player?id=belmar-multiresolution-remote` should work. Note that all folder names in repository/ should work as ?id=<folder_name>
  
4. Configure Paella
  
  To configure paella you need to edit the ´config/config.json´ file. You can read how to configure paella
  in the [configuration page](configure.md)

  In the `config/config.json` file you need to modify the `standalone.repository` parameter to point to your real
  repository folder. This value can be a relative URL or an absolute URL.

  ```javascript
    "standalone": {
        "repository": "../repository/"
    }  
  ```

5. Add some videos to your repository

  In the repository folder you need to create as many folders as videos you want to play. Note that the folder
  name will be the video identifier.
  
  In each video folder you need to create a `data.json` file with the video information. To know more about
  the `data.json` format, please read the [data.json format](integrate_datajson.md) section.
  
6. Test your site again

  Open a browser and point to your `http://server.org/player?id=videoID`. Remember that the `videoID` parameter
  must be the video folder name in the repository.
  
