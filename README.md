[<picture><source align="right" media="(prefers-color-scheme: dark)" srcset=".github/content/logo-fabrizz-white.svg"><source align="right" media="(prefers-color-scheme: light)" srcset=".github/content/logo-fabrizz-githubgray.svg"><img alt="Fabrizz logo" src=".github/content/logo-fabrizz-fill.png" align="right"></picture>](https://fabriz.co/)

#

# MMM-VisualNotifications
A Magic Mirror Module to display customized notifications from home automation services through other modules.

## Work in progress! Come back later!
> Im working on updating the readme and the compatiblity with Dynamic Theming.
> 
> Im going to the redo the module, sacrificing some personalization, but making it look better / streamlined


Im starting UNI, so I dont have much time to reado all the modules that I want, as im working on other things too. Currently redoing MMM-LiveLyrics

## NOT RECOMMENDED:
IF you want yo use the current >>not so great<< version, here are some examples:
```js
// send a notification of type NOTIFICATION_ACTION with the PAYLOAD:
{
    "timeout": 1000000,
    "action": "set",
    "display": [
        {
            "type": "empty"
        },
        [
            {
                "type": "icon",
                "inline": "viewBox='0 0 24 24'",
                "path": "<path fill='currentColor' d='M19.31 18.9C19.75 18.21 20 17.38 20 16.5C20 14 18 12 15.5 12S11 14 11 16.5 13 21 15.5 21C16.37 21 17.19 20.75 17.88 20.32L21 23.39L22.39 22L19.31 18.9M15.5 19C14.12 19 13 17.88 13 16.5S14.12 14 15.5 14 18 15.12 18 16.5 16.88 19 15.5 19M5 20V12H2L12 3L22 12H20.18C19.33 11.11 18.23 10.47 17 10.18L12 5.69L7 10.19V18H9.18C9.35 18.72 9.64 19.39 10.03 20H5Z'/>"
            },
            {
            "type": "gap",
            "size": "small"
            },
            {
                "type": "title",
                "text": "Person detected"
            },
            {
                "type": "subtitle",
                "text": "There is someone at the front door",
                "style": "margin-top: -5px"
            },
            {
            "type": "gap",
            "size": "large"
            },
            {
                "type": "image",
                "url": "localproxy/?url=http://192.168.86.78:8123/local/p/wh.jpeg"
            },
            {
            "type": "gap",
            "size": "bottomreverse"
            }
        ],
        {
            "type": "message",
            "text": "Automated message from Home Assistant"
        }
    ],
    "other": {
        "styles": {
            "backdrop": "background-color: #000000EE;"
        }
    },
    "styleSet": "roundedCenter",
    "animationInName": "fadeIn",
    "animationOutName": "fadeOut"
}
```

```js
{
    "action": "update",
    "display": [
        {
            "type": "empty"
        },
        [
            {
                "type": "icon",
                "url": "localproxy/?url=http://192.168.86.78:8123/local/p/g.png"
            },
            {
            "type": "gap",
            "size": "medium"
            },
            {
                "type": "title",
                "text": "Alguien tocó el timbre"
            },
            {
                "type": "subtitle",
                "text": "There is someone at the front door",
                "style": "margin-top: -5px"
            },
            {
            "type": "gap",
            "size": "large"
            },
            {
                "type": "image",
                "url": "localproxy/?url=http://192.168.86.78:8123/local/p/wh.jpeg"
            },
            {
            "type": "gap",
            "size": "bottomreverse"
            }
        ],
        {
            "type": "message",
            "text": "Automated message from Home Assistant"
        }
    ],
    "other": {
        "styles": {
            "backdrop": "background-color: #000000DD"
        }
    },
    "styleSet": "roundedLeft",
    "useTheme": "default",
    "animationInName": "fadeIn",
    "animationOutName": "slideOutRight"
}
```
