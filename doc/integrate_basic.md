# Integrate Paella in your portal: the basic way

To add Paella Player to your portal, you need to do some easy steps:

1. Copy paella to your portal page

  You need to copy the `player` folder to your portal webserver and make it visible at any URL.

2. Configure Paella
  
  To configure paella you need to edit the ´config/config.json´ file. You can read how to configure paella
  in the [configuration page](configure.md)

  In the `config/config.json` file you need to modify the `standalone.reposiroty` parameter to point to your
  repository folder. This value can be a relative URL or an absolute URL.
  
  ```js
    "standalone": {
        "repository": "../repository/"
    }  
  ```

3. Add some videos to your repository

  In the repository folder you need to create as many folders as videos you want to play. Note that the folder
  name will be the video identifier.
  
  In each video folder you need to create a `data.json` file with the video information. To know more about
  the `data.json` format, please read the [data.json format](integrate_datajson.md) section.
  
4. Test your video

  Open a browser and point to your `http://server.org/player?id=videoID`. Remember that the `videoID` parameter
  must be the video folder name in the repository.
  
