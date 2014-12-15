/*jshint -W003:true */
/*jshint -W107:true */
/*jshint -W057:true */

var Skype = new function () {
    this.name = null;
    this.element = null;
    this.participants = ["echo123"];
    this.listParticipants = "false";
    this.video = "false";
    this.topic = null;
    this.listTopic = "false";
    this.imageSize = null;
    this.imageColor = null;
    this.useDetection = "true";
    this.protocol = "skype:";
    this.version = "1.1.7";
    this.httpProtocol = window.location.protocol !== "https:" ? "http:" : "https:";
    this.ui = l;
    this.setImageAttributes = j;
    this.trimString = o;
    this.escapeString = b;
    this.createDetectionFrame = h;
    this.trySkypeUri_IE9_IE8 = n;
    this.trySkypeUri_IOS_Safari = e;
    this.trySkypeUri_Android_Firefox = q;
    this.trySkypeUri_Generic = a;
    this.SkypeClientDownloadUrl = this.httpProtocol + "//www.skype.com/download";
    this.installSkypeMsg = "Please install Skype application in order to make this call or send a message.";
    this.displayNotSupportedMsg = f;
    this.SkypeUriAssetMap = c;
    this.SkypeUriAssetColorMap = g;
    this.SkypeUriNameLinks = m;
    this.assetPrefix = this.httpProtocol + "//www.skypeassets.com/i/scom/images/skype-buttons/";
    this.assetSizeArray = [10, 12, 14, 16, 24, 32];
    this.assetSizeDefault = 16;
    this.assetMarginMinimum = 16;
    this.assetSize = this.assetSizeDefault;
    this.assetMargin = (this.assetSize >= this.assetMarginMinimum) ? this.assetSize : this.assetMarginMinimum;
    this.assetColorPathWhite = "_trans_";
    this.assetColorFontWhite = "white";
    this.assetColorPathSkype = "_";
    this.assetColorFontSkype = "#444444";
    this.assetColorPathDefault = this.assetColorPathSkype;
    this.assetColorFontDefault = this.assetColorFontSkype;
    this.assetColor = new this.SkypeUriAssetColorMap(this.assetColorPathDefault, this.assetColorFontDefault);
    this.assetSizeMap = {};
    this.assetSizeMap.size10 = new this.SkypeUriAssetMap(10, -18);
    this.assetSizeMap.size12 = new this.SkypeUriAssetMap(12, -19);
    this.assetSizeMap.size14 = new this.SkypeUriAssetMap(14, -19);
    this.assetSizeMap.size16 = new this.SkypeUriAssetMap(16, -20);
    this.assetSizeMap.size24 = new this.SkypeUriAssetMap(24, -30);
    this.assetSizeMap.size32 = new this.SkypeUriAssetMap(32, -41);
    this.focusLinks = new this.SkypeUriNameLinks("", "");
    this.callLinks = new this.SkypeUriNameLinks("call", "");
    this.videoLinks = new this.SkypeUriNameLinks("call", "");
    this.chatLinks = new this.SkypeUriNameLinks("chat", "");
    this.multiChatLinks = new this.SkypeUriNameLinks("chat", "");
    this.dropdownLinks = new this.SkypeUriNameLinks("dropdown", "");
    this.setImageAttributes(this.assetSizeDefault, "");
    this.analyzeSkypeUriInit = null;
    this.analyzeSkypeUriAction = null;
    this.analyzeSkypeUriRedirect = null;
    this.analyzeSkypeUr = null;
    this.analyzePreCrumbs = [];
    this.analyzeCrumbs = [];
    this.analyzeCrumbIndex = -1;
    this.tryAnalyzeSkypeUri = k;
    this.detectSkypeClientFrameId = null;
    this.detectedPlatform = "unknown";
    this.detectedBrowser = "unknown";
    this.isWinXP = false;
    this.isWinVista = false;
    this.isWin7 = false;
    this.isWin8 = false;
    this.isOSX_SnowLeopard = false;
    this.isOSX_MountainLion = false;
    this.isLinux = false;
    this.isWinPhone8 = false;
    this.isAndroid = false;
    this.isAndroid_Gingerbread = false;
    this.isAndroid_IceCream = false;
    this.isAndroid_JellyBean = false;
    this.isIOS6 = false;
    this.isIOS5 = false;
    this.isIOS4 = false;
    this.isIPhone = false;
    this.isIPad = false;
    this.isIPod = false;
    this.isIE10 = false;
    this.isIE9 = false;
    this.isIE8 = false;
    this.isIE7 = false;
    this.isIE6 = false;
    this.isFF = false;
    this.isAndroidBrowser = false;
    this.isChrome = false;
    this.isSafari = false;
    this.showDropdown = i;
    this.hideDropdown = d;
    this.analyzeScript = this.httpProtocol + "/js/" + "skype-analytics.js";
    this.includeJavascript = p;
    this.includeJavascript(this.analyzeScript);
    if (navigator.userAgent.indexOf("Windows NT 5.1") !== -1) {
      this.isWinXP = true;
      this.detectedPlatform = "Windows XP"
    } else {
      if (navigator.userAgent.indexOf("Windows NT 6.0") !== -1) {
        this.isWinVista = true;
        this.detectedPlatform = "Windows Vista"
      } else {
        if (navigator.userAgent.indexOf("Windows NT 6.1") !== -1) {
          this.isWin7 = true;
          this.detectedPlatform = "Windows 7"
        } else {
          if (navigator.userAgent.indexOf("Windows NT 6.2") !== -1) {
            this.isWin8 = true;
            this.detectedPlatform = "Windows 8"
          } else {
            if (navigator.userAgent.indexOf("Mac OS X 10_7") !== -1) {
              this.isOSX_SnowLeopard = true;
              this.detectedPlatform = "OSX 10.7"
            } else {
              if (navigator.userAgent.indexOf("Mac OS X 10.8") !== -1) {
                this.isOSX_MountainLion = true;
                this.detectedPlatform = "OSX 10.8"
              } else {
                if (navigator.userAgent.indexOf("Mac OS X 10_8") !== -1) {
                  this.isOSX_MountainLion = true;
                  this.detectedPlatform = "OSX 10.8"
                } else {
                  if (navigator.userAgent.indexOf("Linux") !== -1) {
                    this.isLinux = true;
                    this.detectedPlatform = "Linux"
                  } else {
                    if (navigator.userAgent.indexOf("Windows Phone 8") !== -1) {
                      this.isWinPhone8 = true;
                      this.detectedPlatform = "Windows Phone 8"
                    } else {
                      if (navigator.userAgent.indexOf("Android") !== -1) {
                        this.isAndroid = true;
                        this.detectedPlatform = "Android"
                      } else {
                        if (navigator.userAgent.indexOf("Android 2.3") !== -1) {
                          this.isAndroid_Gingerbread = true;
                          this.detectedPlatform = "Android 2.3"
                        } else {
                          if (navigator.userAgent.indexOf("Android 4.0") !== -1) {
                            this.isAndroid_IceCream = true;
                            this.detectedPlatform = "Android 4.0"
                          } else {
                            if (navigator.userAgent.indexOf("Android 4.1") !== -1) {
                              this.isAndroid_JellyBean = true;
                              this.detectedPlatform = "Android 4.1"
                            } else {
                              if (navigator.userAgent.match(/OS 6_[0-9_]+ like Mac OS X/i)) {
                                this.isIOS6 = true;
                                this.detectedPlatform = "iOS6"
                              } else {
                                if (navigator.userAgent.match(/OS 5_[0-9_]+ like Mac OS X/i)) {
                                  this.isIOS5 = true;
                                  this.detectedPlatform = "iOS5"
                                } else {
                                  if (navigator.userAgent.match(/OS 4_[0-9_]+ like Mac OS X/i)) {
                                    this.isIOS4 = true;
                                    this.detectedPlatform = "iOS4"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } if (navigator.userAgent.indexOf("iPhone") !== -1) {
      this.isIPhone = true;
      this.detectedPlatform = "iPhone " + this.detectedPlatform
    } else {
      if (navigator.userAgent.indexOf("iPad") !== -1) {
        this.IsPad = true;
        this.detectedPlatform = "iPad " + this.detectedPlatform
      } else {
        if (navigator.userAgent.indexOf("iPod") !== -1) {
          this.IsPod = true;
          this.detectedPlatform = "iPod " + this.detectedPlatform
        }
      }
    } if (navigator.userAgent.indexOf("MSIE 10") !== -1) {
      this.isIE10 = true;
      this.detectedBrowser = "Internet Explorer 10"
    } else {
      if (navigator.userAgent.indexOf("MSIE 9") !== -1) {
        this.isIE9 = true;
        this.detectedBrowser = "Internet Explorer 9"
      } else {
        if (navigator.userAgent.indexOf("MSIE 8") !== -1) {
          this.isIE8 = true;
          this.detectedBrowser = "Internet Explorer 8"
        } else {
          if (navigator.userAgent.indexOf("MSIE 7") !== -1) {
            this.isIE7 = true;
            this.detectedBrowser = "Internet Explorer 7"
          } else {
            if (navigator.userAgent.indexOf("MSIE 6") !== -1) {
              this.isIE6 = true;
              this.detectedBrowser = "Internet Explorer 6"
            } else {
              if (navigator.userAgent.indexOf("Firefox") !== -1) {
                this.isFF = true;
                this.detectedBrowser = "Firefox"
              } else {
                if (navigator.userAgent.indexOf("Chrome") !== -1) {
                  this.isChrome = true;
                  this.detectedBrowser = "Chrome"
                } else {
                  if (navigator.userAgent.indexOf("Mobile Safari") !== -1 && this.isAndroid) {
                    this.isAndroidBrowser = true;
                    this.detectedBrowser = "Mobile Safari"
                  } else {
                    if (navigator.userAgent.indexOf("Safari") !== -1) {
                      this.isSafari = true;
                      this.detectedBrowser = "Safari"
                    }
                  }
                }
              }
            }
          }
        }
      }
    } if (this.isLinux) {
      this.useDetection = "false"
    }
    if (this.isAndroid) {
      this.SkypeClientDownloadUrl = "market://details?id=com.skype.raider"
    } else {
      if (this.isIOS6 || this.isIOS5 || this.isIOS4) {
        this.SkypeClientDownloadUrl = "itms-apps://itunes.com/apps/skype"
      }
    }

    function f() {
      alert("Sorry this device doesn't support Skype Buttons yet. Please add " + this.participants[0] + " as a contact in your Skype Client to MAKE this call.")
    }

    function i(r) {
      document.getElementById(r).style.display = "block";
      if (typeof (window["timer_" + r]) !== "undefined") {
        window.clearTimeout(window["timer_" + r])
      }
      window["timer_" + r] = null;
      delete window["timer_" + r]
    }

    function d(r) {
      window["timer_" + r] = window.setTimeout(function () {
        document.getElementById(r).style.display = "none"
      }, 1000)
    }

    function k(r, s) {
      if (!this.analyzeSkypeUri && typeof analyzeSkypeUri === "function") {
        this.analyzeSkypeUri = analyzeSkypeUri
      }
      if (typeof this.analyzeSkypeUri === "function") {
        this.analyzeSkypeUri(r, s)
      } else {
        var t = {};
        t.prop3 = "image size / color: " + this.imageSize + " / " + this.imageColor;
        t.prop4 = "video / list participants / list topic: " + this.video + " / " + this.listParticipants + " / " + this.listTopic;
        t.prop5 = "target(s): " + this.participants;
        t.prop6 = "user agent: " + navigator.userAgent;
        t.prop7 = "detected protocol: " + window.location.protocol;
        t.prop8 = "detected platform: " + this.detectedPlatform;
        t.prop9 = "detected browser: " + this.detectedBrowser;
        t.prop10 = this.version + " (pre script load)";
        if (r === "init") {
          if (this.name === this.chatLinks.name) {
            t.prop11 = "Chat Init"
          } else {
            if (this.name === this.callLinks.name) {
              t.prop11 = "Call Init"
            } else {
              if (this.name === this.dropdownLinks.name) {
                t.prop11 = "Dropdown Init"
              }
            }
          }
          t.prop12 = document.domain + " - Init"
        } else {
          if (r === "chat") {
            t.prop11 = "Chat Action";
            t.prop13 = document.domain + " - Chat"
          } else {
            if (r === "call") {
              t.prop11 = "Call Action";
              t.prop14 = document.domain + " - Call"
            } else {
              if (r === "dropdownChat") {
                t.prop11 = "Dropdown Chat Action";
                t.prop13 = document.domain + " - Chat"
              } else {
                if (r === "dropdownCall") {
                  t.prop11 = "Dropdown Call Action";
                  t.prop14 = document.domain + " - Call"
                } else {
                  if (r === "redirect") {
                    t.prop11 = "Redirect"
                  }
                }
              }
            }
          }
        }
        this.analyzePreCrumbs.push(t)
      }
    }

    function p(s) {
      var r = document.getElementsByTagName("head")[0];
      var t = document.createElement("script");
      t.setAttribute("type", "text/javascript");
      t.setAttribute("src", s);
      r.appendChild(t)
    }

    function c(s, r) {
      this.size = s;
      this.verticalOffset = r
    }

    function g(s, r) {
      this.path = s;
      this.font = r
    }

    function m(r, s) {
      this.name = r;
      this.linkImage = s
    }

    function l(L) {
      this.name = null;
      if ((L.name !== undefined) && (L.name !== null)) {
        this.name = L.name
      }
      if ((L.element !== undefined) && (L.element !== null)) {
        this.element = L.element
      }
      if ((L.participants !== undefined) && (L.participants !== null)) {
        this.participants = L.participants
      }
      if ((L.listParticipants !== undefined) && (L.listParticipants !== null)) {
        this.listParticipants = L.listParticipants
      }
      if ((L.video !== undefined) && (L.video !== null)) {
        this.video = L.video
      }
      if ((L.topic !== undefined) && (L.topic !== null)) {
        this.topic = L.topic
      }
      if ((L.listTopic !== undefined) && (L.listTopic !== null)) {
        this.listTopic = L.listTopic
      }
      if ((L.imageSize !== undefined) && (L.imageSize !== null)) {
        this.imageSize = L.imageSize
      }
      if ((L.imageColor !== undefined) && (L.imageColor !== null)) {
        this.imageColor = L.imageColor
      }
      if ((L.useDetection !== undefined) && (L.useDetection !== null)) {
        this.useDetection = L.useDetection
      }
      if (this.useDetection === "false") {
        this.useDetection = false
      } else {
        if (this.useDetection === "true") {
          this.useDetection = true
        }
      } if ((L.protocol !== undefined) && (L.protocol !== null)) {
        this.protocol = L.protocol
      } else {
        this.protocol = "skype:"
      }
      var G = {};
      G.prop0 = this.name;
      G.prop3 = "image size / color: " + this.imageSize + " / " + this.imageColor;
      G.prop4 = "video / list participants / list topic: " + this.video + " / " + this.listParticipants + " / " + this.listTopic;
      G.prop5 = "target(s): " + this.participants;
      G.prop6 = "user agent: " + navigator.userAgent;
      G.prop7 = "detected protocol: " + window.location.protocol;
      G.prop8 = "detected platform: " + this.detectedPlatform;
      G.prop9 = "detected browser: " + this.detectedBrowser;
      G.prop10 = this.version;
      this.analyzeCrumbs.push(G);
      this.analyzeCrumbIndex += 1;
      var y;
      var P;
      y = this.trimString(L.element);
      if (y.length !== 0) {
        P = document.getElementById(y);
        if (P === null) {
          alert("Sorry! Could not find Skype URI parent element: " + y + " ('" + L.element + "')");
          return (false)
        } else {
          if (((L.name !== undefined) && (L.name !== null)) && ((L.participants === undefined) || (L.participants === null))) {
            alert("Error! Required member 'participants' omitted or specified as null");
            return (false)
          }
        }
      } else {
        alert("Error! Required member 'element' (Skype URI parent element) omitted or specified as null");
        return (false)
      }
      this.setImageAttributes(L.imageSize, this.trimString(L.imageColor));
      if ((L.protocol !== undefined) && (L.protocol !== null)) {
        this.protocol = L.protocol
      }
      var B = this.protocol;
      var C = "";
      var x = 0;
      var u = false;
      if ((L.participants !== undefined) && (L.participants !== null)) {
        while (x < L.participants.length) {
          if (L.participants[x] !== null) {
            y = this.trimString(L.participants[x]);
            if (y.length !== 0) {
              if (x !== 0) {
                B += ";";
                C += ", ";
                u = true
              }
              B += y;
              C += y
            }
          }
          x++
        }
      }
      var H = this.focusLinks.name;
      var w = this.focusLinks.linkImage;
      var M = this.focusLinks.linkImageAltTag;
      var F = this.focusLinks.role;
      var D = false;
      y = this.trimString(L.name);
      if (y.length !== 0) {
        H = y;
        if (H === this.callLinks.name) {
          D = true;
          w = this.callLinks.linkImage;
          M = this.callLinks.linkImageAltTag;
          F = this.callLinks.role
        } else {
          if (H === this.chatLinks.name) {
            if (u) {
              w = this.multiChatLinks.linkImage;
              M = this.multiChatLinks.linkImageAltTag;
              F = this.multiChatLinks.role
            } else {
              w = this.chatLinks.linkImage;
              M = this.chatLinks.linkImageAltTag;
              F = this.chatLinks.role
            }
          } else {
            if (H === this.dropdownLinks.name) {
              w = this.dropdownLinks.linkImage;
              M = this.dropdownLinks.linkImageAltTag;
              F = this.dropdownLinks.role
            } else {
              alert("Unrecognized Skype URI name: " + H + " ('" + L.name + "') -- " + this.callLinks.name + "/" + this.chatLinks.name);
              return (false)
            }
          }
        }
        B += "?" + H
      } else {
        if (C.length > 0) {
          w = this.callLinks.linkImage;
          M = this.callLinks.linkImageAltTag;
          F = this.callLinks.role
        }
      } if (D) {
        y = this.trimString(L.video);
        if (y === "true") {
          w = this.videoLinks.linkImage;
          M = this.videoLinks.linkImageAltTag;
          F = this.videoLinks.role;
          B += "&video=" + y
        }
      }
      var s = null;
      if ((u) && ((D) || (H === this.chatLinks.name))) {
        y = this.trimString(L.topic);
        if (y.length > 0) {
          s = y;
          B += "&topic=" + b(s)
        }
      }
      var N = document.createElement("a");
      var v = "";
      var A = "";
      if (!this.useDetection || (this.isWin8 && this.isIE10) || this.isIE7 || this.isIE6) {
        A = B
      } else {
        if ((this.isWinPhone8 && this.isIE10) || (this.isAndroid && this.isAndroidBrowser) || (this.isAndroid && this.isChrome)) {
          A = "javascript://";
          v += " Skype.displayNotSupportedMsg();"
        } else {
          y = "Skype.trySkypeUri_Generic";
          if (this.isIE10 || this.isIE9 || this.isIE8) {
            y = "Skype.trySkypeUri_IE9_IE8"
          } else {
            if ((this.isIOS6 || this.isIOS5 || this.isIOS4) && this.isSafari) {
              y = "Skype.trySkypeUri_IOS_Safari"
            } else {
              if (this.isAndroid && this.isFF) {
                y = "Skype.trySkypeUri_Android_Firefox"
              }
            }
          } if (this.detectSkypeClientFrameId === null) {
            this.createDetectionFrame(this.P);
          }
          A = "javascript://";
          v += y + "('" + B + "', '" + this.detectSkypeClientFrameId + "', '" + this.analyzeCrumbIndex + "'); return false;"
        }
      }
      var z = document.createElement("img");
      z.setAttribute("src", w);
      z.setAttribute("alt", M);
      z.setAttribute("role", F);
      z.setAttribute("style", ("border:0; margin:" + this.assetMargin + "px; vertical-align:" + this.assetSizeMap[("size" + this.assetSize)].verticalOffset + "px;"));
      if (this.name === this.dropdownLinks.name) {
        z.setAttribute("onmouseover", "Skype.showDropdown('dropdown_" + this.element + "'); return false;");
        z.setAttribute("onmouseout", "Skype.hideDropdown('dropdown_" + this.element + "'); return false;");
        N.setAttribute("style", "cursor: text;");
        N.setAttribute("onfocus", "Skype.showDropdown('dropdown_" + this.element + "'); return false;");
        N.setAttribute("onblur", "Skype.hideDropdown('dropdown_" + this.element + "'); return false;");
        N.setAttribute("href", "javascript://");
        N.setAttribute("onclick", "return false;")
      } else {
        if (this.name === this.chatLinks.name) {
          v = "Skype.tryAnalyzeSkypeUri('chat', '" + this.analyzeCrumbIndex + "');" + v
        } else {
          v = "Skype.tryAnalyzeSkypeUri('call', '" + this.analyzeCrumbIndex + "');" + v
        }
        N.setAttribute("href", A);
        N.setAttribute("onclick", v)
      }
      N.appendChild(z);
      uriPara = document.createElement("p");
      uriPara.setAttribute("id", (L.element + "_paraElement"));
      uriPara.setAttribute("style", ("font-size:" + (this.assetSize - 2) + "px; color:" + this.assetColor.font));
      uriPara.appendChild(N);
      if (this.name === this.dropdownLinks.name) {
        var O = "-10";
        var J = "15";
        if (this.assetSize === "10") {
          J = "15"
        } else {
          if (this.assetSize === "12") {
            J = "15"
          } else {
            if (this.assetSize === "14") {
              J = "15"
            } else {
              if (this.assetSize === "16") {
                J = "15"
              } else {
                if (this.assetSize === "24") {
                  O = "-20";
                  J = "25"
                } else {
                  if (this.assetSize === "32") {
                    O = "-30";
                    J = "30"
                  }
                }
              }
            }
          }
        }
        var r = document.createElement("ul");
        r.id = "dropdown_" + this.element;
        r.setAttribute("style", "display: none; position: absolute; margin-top: " + O + "px; margin-left: " + J + "px; width: 200px; padding-left: 20px; padding-right: 20px; border: 2px solid #00AFF0; background-color: white; color: #00AFF0; line-height: 50px; list-style: none; list-style-type: none;");
        r.setAttribute("onmouseover", "Skype.showDropdown('dropdown_" + this.element + "'); return false;");
        r.setAttribute("onmouseout", "Skype.hideDropdown('dropdown_" + this.element + "'); return false;");
        var t = document.createElement("li");
        t.setAttribute("style", "list-style: none; list-style-type: none;");
        var Q = document.createElement("li");
        Q.setAttribute("style", "list-style: none; list-style-type: none;");
        var K = "";
        var I = document.createElement("a");
        I.href = "javascript://";
        I.setAttribute("style", "text-decoration: none; color: #00AFF0; font-size: 16px;");
        I.setAttribute("href", A);
        K = "Skype.tryAnalyzeSkypeUri('dropdownCall', '" + this.analyzeCrumbIndex + "');" + v;
        I.setAttribute("onclick", K.replace("?" + this.dropdownLinks.name, "?" + this.callLinks.name));
        I.setAttribute("onmouseover", "this.style.textDecoration = 'underline'");
        I.setAttribute("onmouseout", "this.style.textDecoration = 'none'");
        I.setAttribute("role", "Menu item");
        I.setAttribute("onfocus", "Skype.showDropdown('dropdown_" + this.element + "'); return false;");
        I.setAttribute("onblur", "Skype.hideDropdown('dropdown_" + this.element + "'); return false;");
        var E = document.createElement("a");
        E.href = "javascript://";
        E.setAttribute("style", "text-decoration: none; color: #00AFF0; font-size: 16px;");
        E.setAttribute("href", A);
        K = "Skype.tryAnalyzeSkypeUri('dropdownChat', '" + this.analyzeCrumbIndex + "');" + v;
        E.setAttribute("onclick", K.replace("?" + this.dropdownLinks.name, "?" + this.chatLinks.name));
        E.setAttribute("onmouseover", "this.style.textDecoration = 'underline'");
        E.setAttribute("onmouseout", "this.style.textDecoration = 'none'");
        I.setAttribute("role", "Menu item");
        E.setAttribute("onfocus", "Skype.showDropdown('dropdown_" + this.element + "'); return false;");
        E.setAttribute("onblur", "Skype.hideDropdown('dropdown_" + this.element + "'); return false;");
        I.innerHTML = "Call";
        t.appendChild(I);
        E.innerHTML = "Chat";
        Q.appendChild(E);
        r.appendChild(t);
        r.appendChild(Q);
        uriPara.appendChild(r)
      }
      y = null;
      if (C.length !== 0) {
        if (this.trimString(L.listParticipants) === "true") {
          y = " " + C
        }
        if ((s !== null) && (this.trimString(L.listTopic) === "true")) {
          if ((y === null) || (y.length === 0)) {
            y = " RE: " + s
          } else {
            y += ("; RE: " + s)
          }
        }
        if (y === null) {
          y = ""
        }
        uriPara.appendChild(document.createTextNode(y))
      }
      P.appendChild(uriPara);
      this.tryAnalyzeSkypeUri("init", this.analyzeCrumbIndex);
      return (true)
    }

    function j(u, r) {
      this.assetSize = this.assetSizeDefault;
      this.assetMargin = (this.assetSize >= this.assetMarginMinimum) ? this.assetSize : this.assetMarginMinimum;
      var t;
      var s = this.assetSizeArray.length;
      for (t = 0; t < s; t++) {
        if (u === this.assetSizeArray[t]) {
          this.assetSize = u;
          break
        }
      }
      this.assetMargin = (this.assetSize >= this.assetMarginMinimum) ? this.assetSize : this.assetMarginMinimum;
      this.assetColor.path = this.assetColorPathDefault;
      this.assetColor.font = this.assetColorFontDefault;
      if (r.length > 0) {
        if (r === "skype") {
          this.assetColor.path = this.assetColorPathSkype;
          this.assetColor.font = this.assetColorFontSkype
        } else {
          if (r === "white") {
            this.assetColor.path = this.assetColorPathWhite;
            this.assetColor.font = this.assetColorFontWhite
          }
        }
      }
      this.focusLinks.linkImage = this.assetPrefix + "Skypeicon" + this.assetColor.path + this.assetSize + "px.png";
      this.callLinks.linkImage = this.assetPrefix + "callbutton" + this.assetColor.path + this.assetSize + "px.png";
      this.videoLinks.linkImage = this.assetPrefix + "callbutton" + this.assetColor.path + this.assetSize + "px.png";
      this.chatLinks.linkImage = this.assetPrefix + "chatbutton" + this.assetColor.path + this.assetSize + "px.png";
      this.multiChatLinks.linkImage = this.assetPrefix + "chatbutton" + this.assetColor.path + this.assetSize + "px.png";
      this.dropdownLinks.linkImage = this.assetPrefix + "dropdowncallbutton" + this.assetColor.path + this.assetSize + "px.png";
      this.focusLinks.linkImageAltTag = "Open Skype";
      this.callLinks.linkImageAltTag = "Skype call";
      this.videoLinks.linkImageAltTag = "Skype call";
      this.chatLinks.linkImageAltTag = "Skype chat, instant message";
      this.multiChatLinks.linkImageAltTag = "Skype chat, instant message";
      this.dropdownLinks.linkImageAltTag = "Call options";
      this.focusLinks.role = "Button";
      this.callLinks.role = "Button";
      this.videoLinks.role = "Button";
      this.chatLinks.role = "Button";
      this.multiChatLinks.role = "Button";
      this.dropdownLinks.role = "Pop up menu"
    }

    function o(t) {
      if ((t === undefined) || (t === null)) {
        return ("")
      }
      var u = t.length;
      var s = u - 1;
      var r = false;
      while ((!r) && (u > 0)) {
        switch (t[s]) {
        case " ":
        case "\t":
        case "\n":
        case "\r":
          u--;
          break;
        default:
          r = true;
          break
        }
        s--
      }
      if (u > 0) {
        return (t.substr(0, u))
      }
      return ("")
    }

    function b(s) {
      if ((s === undefined) || (s === null)) {
        return ("")
      }
      var r = s.replace(/\s/g, "%20");
      r = r.replace(/:/g, "%3A");
      r = r.replace(/\x2F/g, "%2F");
      return (r.replace(/\x5C/g, "%5C"))
    }

    function h(r) {
      if(!r) {
        var divs = document.getElementsByTagName("div");
        for(var i = 0; i < divs.length; i++) {
          if(divs[i].id && divs[i].id.match("SkypeButton")) {
            r = divs[i];
          }
        }
      }
      var t = new Date();
      this.detectSkypeClientFrameId = "_detectSkypeClient_" + t.getTime().toString();
      var s = document.createElement("iframe");
      s.setAttribute("style", "display:none;");
      s.setAttribute("id", this.detectSkypeClientFrameId);
      r.appendChild(s);
    }

    function n(s, w, u) {
      var v = false;
      var r = window.open("", "_blank", "width=100, height=100");
      var t = r.document.createElement("iframe");
      t.setAttribute("src", s);
      r.document.body.appendChild(t);
      setTimeout(function () {
        try {
          r.location.href;
          v = true
        } catch (x) {}
        if (v) {
          r.setTimeout("window.close()", 10)
        } else {
          r.close();
          alert(Skype.installSkypeMsg);
          Skype.tryAnalyzeSkypeUri("redirect", u);
          window.location = Skype.SkypeClientDownloadUrl
        }
      }, 100)
    }

    function e(s, v, t) {
      var r = document.getElementById(v);
      var u = true;
      window.addEventListener("pagehide", function () {
        u = false
      }, false);
      if (r !== null) {
        r.src = s
      }
      setTimeout(function () {
        if (u) {
          alert(Skype.installSkypeMsg);
          Skype.tryAnalyzeSkypeUri("redirect", t);
          window.location = Skype.SkypeClientDownloadUrl
        }
      }, 2000)
    }

    function q(s, v, u) {
      var t = false;
      var r = document.getElementById(v);
      if (r !== null) {
        try {
          r.contentWindow.location.href = s;
          t = true
        } catch (w) {
          t = false
        }
      }
      setTimeout(function () {
        if (!t) {
          alert(Skype.installSkypeMsg);
          Skype.tryAnalyzeSkypeUri("redirect", u);
          window.location = Skype.SkypeClientDownloadUrl
        }
      }, 2000)
    }

    function a(s, v, t) {
      var u = true;
      window.onblur = function () {
        u = false
      };
      var r = document.getElementById(v);
      if (r !== null) {
        r.src = s
      }
      setTimeout(function () {
        if (u) {
          alert(Skype.installSkypeMsg);
          Skype.tryAnalyzeSkypeUri("redirect", t);
          window.location = Skype.SkypeClientDownloadUrl
        }
      }, 2000)
    }
  }();
  
/*jshint +W003:true */
/*jshint +W107:true */
/*jshint +W057:true */
