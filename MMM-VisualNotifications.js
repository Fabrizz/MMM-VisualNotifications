/*
 * MMM-VisualNotifications
 * MIT License
 *
 * By Fabrizio Baptista <3
 */

Module.register("MMM-VisualNotifications", {
  /* Magic Mirror configuration */
  /** Requiered Magic Mirror version */
  requiresVersion: "2.12.0",
  defaults: {
    /** Module name */
    name: "MMM-VisualNotifications",
    /** Animation speed for status data */
    animationSpeed: 1500,
    /** Default notification timeout */
    defaultExpiration: 10000,
    /** Registers MMM-VisualNotifications in MMM-Remote-Control */
    exposeApi: true,
    /** Use themes bradcasted from other modules */
    useDynamicTheming: false,
    /** Animation data */
    animationTiming: [
      {
        name: "fadeIn",
        timeout: 2000
      },
      {
        name: "fadeOut",
        timeout: 1900
      },
      {
        name: "slideInLeft",
        timeout: 1500
      },
      {
        name: "slideInTop",
        timeout: 1500
      },
      {
        name: "slideOutBelow",
        timeout: 1400
      },
      {
        name: "slideOutRight",
        timeout: 1400
      }
    ],
    /** Notification events */
    events: {
      NOTIFICATION_ACTION: "NOTIFICATION_ACTION",
      ALL_MODULES_STARTED: "ALL_MODULES_STARTED"
    }
  },

  /* Module API Schema declaration */
  apiSchemaPayload: {
    module: "MMM-VisualNotifications",
    path: "MMM-VisualNotifications",
    actions: {
      notification_action: {
        method: "POST",
        notification: "NOTIFICATION_ACTION",
        prettyName: "Show/Update/Delete Notification"
      }
    }
  },
  registerApi: function () {
    this.sendNotification("REGISTER_API", this.apiSchemaPayload);
    console.info(
      this.name + " | Sending registration payload to MMM-Remote-Control"
    );
  },

  /* Magic Mirror Loaders */
  getScripts: function () {
    return []; // return ["moment.js"];
  },
  getStyles: function () {
    let styles = [this.file("css/included.css"), this.file("css/custom.css")];
    return styles;
  },
  getTranslations: function () {
    return {
      en: "translations/en.json",
      es: "translations/es.json"
    };
  },

  getTemplate: function () {
    return "overlay.njk";
  },

  start: function () {
    this.logBadge();
    this.error = null;
    this.notification = null;
    this.tm = null;
    this.tmc = null;
    this.themeData = [
      /*[{key: <moduleVar>, default: <defaultValue>, x: <externalTheme>}] */
      {
        key: "--VSNO-THEME-DARK-TEXT-COLOR-BRIGHT",
        default: "--VSNO-THEME-DEF-DARK-TEXT-COLOR-BRIGHT",
        dynamicTheme: "--SP-LightVibrant"
      },
      {
        key: "--VSNO-THEME-DARK-TEXT-COLOR",
        default: "--VSNO-THEME-DEF-DARK-TEXT-COLOR",
        dynamicTheme: "--SP-LightVibrant"
      },
      {
        key: "--VSNO-THEME-DARK-TEXT-COLOR-DIMMED",
        default: "--VSNO-THEME-DEF-DARK-TEXT-COLOR-DIMMED",
        dynamicTheme: "--SP-LightVibrant"
      },
      {
        key: "--VSNO-THEME-DARK-BACKGROUND",
        default: "--VSNO-THEME-DEF-DARK-BACKGROUND",
        dynamicTheme: "--SP-DarkMuted"
      },
      {
        key: "--VSNO-THEME-LIGHT-TEXT-COLOR-BRIGHT",
        default: "--VSNO-THEME-DEF-LIGHT-TEXT-COLOR-BRIGHT",
        dynamicTheme: "--SP-DarkMuted"
      },
      {
        key: "--VSNO-THEME-LIGHT-TEXT-COLOR",
        default: "--VSNO-THEME-DEF-LIGHT-TEXT-COLOR",
        dynamicTheme: "--SP-DarkMuted"
      },
      {
        key: "--VSNO-THEME-LIGHT-TEXT-COLOR-DIMMED",
        default: "--VSNO-THEME-DEF-LIGHT-TEXT-COLOR-DIMMED",
        dynamicTheme: "--SP-DarkMuted"
      },
      {
        key: "--VSNO-THEME-LIGHT-BACKGROUND",
        default: "--VSNO-THEME-DEF-LIGHT-BACKGROUND",
        dynamicTheme: "--SP-LightVibrant"
      }
    ];

    this.setDinamicTheme("default");

    let root = document.querySelector(":root");
    root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
    root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);

    if (this.data.position !== "fullscreen_above" && this.data.header) {
      this.setError("ERROR_POSITION");
    } else {
      if (this.data.header) this.setError("ERROR_HEADER");
      if (this.data.position !== "fullscreen_above")
        this.setError("ERROR_POSITION");
    }
  },

  notificationReceived: function (notification, payload) {
    this.config.events[notification]?.split(" ").forEach((e) => {
      switch (e) {
        case "NOTIFICATION_ACTION":
          if (!this.verifyPayload(payload)) return;
          switch (payload.action.toLowerCase()) {
            case "set":
              this.set(payload);
              break;
            case "update":
              this.update(payload);
              break;
            case "delete":
              this.delete(payload);
              break;
            default:
              break;
          }
          break;
        case "ALL_MODULES_STARTED":
          this.registerApi();
          break;
        default:
          break;
      }
    });
  },

  set: function (payload) {
    // Delete old notification timer so it does not block the new one.
    if (this.tm) clearTimeout(this.tm);

    // Get the animation data declared in the CSS files.
    let root = document.querySelector(":root");
    let animationIn = this.getAnimationSet(
      payload.animationInName,
      getComputedStyle(root)
    );
    let animationOut = this.getAnimationSet(
      payload.animationOutName,
      getComputedStyle(root)
    );
    this.notification = {
      animationStatus: null,
      animationIn,
      animationOut,
      ...payload
    };

    this.setDinamicTheme(payload.useTheme);

    // Select between the default timeouts or the defined by the user/animation
    if (this.notification.animationIn) {
      this.notification.animationStatus = "in";
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 1);
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 0);
      this.updateDom();
    } else {
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 1);
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 0);
      this.updateDom();
    }

    // Use the default timeout or the defined in the payload
    let timeout = payload.timeout
      ? payload.timeout
      : this.config.defaultExpiration;

    if (
      payload.timeout !== 0 &&
      this.notification.animationIn &&
      this.notification.animationIn.timeout
    )
      timeout = timeout + this.notification.animationIn.timeout;

    // If the timeout is 0, do not remove the notification
    if (payload.timeout !== 0) {
      this.tm = setTimeout(() => {
        if (!this.notification.animationOut) {
          this.notification = null;
          root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
          root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
          this.updateDom();
          this.tm = null;
        } else {
          this.notification.animationStatus = "out";
          this.updateDom();
          // If there is an animation to end the notification, replace the timer to the animation timeout
          this.notification.animationStatus = "out";
          this.updateDom();
          this.tm = setTimeout(() => {
            this.notification = null;
            root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
            root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
            this.updateDom();
            this.tm = null;
          }, this.notification.animationOut.timeout);
        }
      }, timeout);
    }
  },

  delete: function () {
    this.notification.action = "delete";
    if (this.tm) clearTimeout(this.tm);
    let root = document.querySelector(":root");
    if (this.notification.animationOut) {
      this.notification.animationStatus = "out";
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
      this.updateDom();
      this.tm = setTimeout(() => {
        this.notification = null;
        this.updateDom();
        this.tm = null;
      }, this.notification.animationOut.timeout);
    } else {
      if (this.tm) clearTimeout(this.tm);
      this.tm = null;
      this.notification = null;
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
      root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
      this.updateDom();
    }
  },

  update: function (payload) {
    if (!this.verifyPayload(payload)) return;
    if (!this.notification) return;

    // Delete old notification timer so it does not block the new one.
    if (this.tm && payload.timeout) clearTimeout(this.tm);

    // Get the animation data declared in the CSS files.
    let root = document.querySelector(":root");
    let animationOut = this.getAnimationSet(
      payload.animationOutName,
      getComputedStyle(root)
    );

    if (this.notification.useTheme !== payload.useTheme)
      this.setDinamicTheme(payload.useTheme);

    this.notification = Object.assign(
      this.notification,
      animationOut
        ? { ...payload, animationOut, animationIn: null }
        : { ...payload, animationIn: null }
    );

    root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 1);
    root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 0);
    this.updateDom();

    if (payload.timeout === 0) return;
    if (this.tm && payload.timeout) {
      this.tm = setTimeout(() => {
        if (!this.notification.animationOut) {
          this.notification = null;
          root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
          root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
          this.updateDom();
          this.tm = null;
        } else {
          this.notification.animationStatus = "out";
          this.updateDom();
          // If there is an animation to end the notification, replace the timer to the animation timeout
          this.notification.animationStatus = "out";
          this.updateDom();
          this.tm = setTimeout(() => {
            this.notification = null;
            root.style.setProperty("--VSNO-CURRENT-NOTIFICATION", 0);
            root.style.setProperty("--VSNO-CURRENT-NOTIFICATION-INVERSE", 1);
            this.updateDom();
            this.tm = null;
          }, this.notification.animationOut.timeout);
        }
      }, payload.timeout);
    }
  },

  verifyPayload: function (payload) {
    let error = {
      payload
    };
    try {
      if (!payload.action || payload.action === "") {
        this.setError("PAYLOAD_MALFORMED", {
          key: "payload.action",
          info: "Action was not definded. Available options are: SET/UPDATE/DELETE"
        });
        return false;
      }
      let action = payload.action.toLowerCase();
      if (!(action === "set" || action === "delete" || action === "update")) {
        this.setError("PAYLOAD_MALFORMED", {
          key: "payload.action",
          info: `"${action}" is not an action. Available options are: SET/UPDATE/DELETE`
        });
        return false;
      }
    } catch (e) {
      this.setError("PAYLOAD_MALFORMED", {
        info: "An error ocurred in payload verification",
        error
      });
      return false;
    }
    return true;
  },

  setDinamicTheme: function (data) {
    let root = document.querySelector(":root");
    if (!data || data !== "default") {
      this.themeData.forEach((pair) =>
        root.style.setProperty(pair.key, `var(${pair[data]})`)
      );
    } else {
      this.themeData.forEach((pair) =>
        root.style.setProperty(pair.key, `var(${pair.default})`)
      );
    }
  },

  getAnimationSet: function (name, declared) {
    name
      ? {
          name,
          timeout: Number(
            declared
              .getPropertyValue(
                `--VSNO-ANIMATION-DECLARATION-${name.toUpperCase()}`
              )
              .trim()
          ),
          lookup: `--VSNO-ANIMATION-DECLARATION-${name.toUpperCase()}`
        }
      : null;
  },

  getTemplateData: function () {
    return {
      notification: this.notification,
      config: this.config,
      error: this.error
    };
  },

  /* Sets the error globally in the module and updates the DOM */
  setError: function (type, err, delay = 10000) {
    if (!type && err) this.type = "ERROR_UNDEF";
    if (!type && !err) this.type = "ERROR_UNDEF";
    this.error = { type };
    this.notification = null;
    this.updateDom(this.config.animationSpeed);
    console.warn(`${this.name} | ${type ? type : "UNKNOWN"}`, err);
    setTimeout(() => {
      this.error = null;
      this.updateDom(this.config.animationSpeed);
    }, delay);
  },

  /* Logs the module badge */
  logBadge: function () {
    console.log(
      `\n %c by Fabrizz %c ${this.name} %c \n`,
      "background-color: #555;color: #fff;padding: 3px 2px 3px 3px;border-radius: 3px 0 0 3px;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)",
      "background-color: #bc81e0;background-image: linear-gradient(90deg, #134E4A, #14B8A6);color: #fff;padding: 3px 3px 3px 2px;border-radius: 0 3px 3px 0;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)",
      "background-color: transparent"
    );
  }
});
