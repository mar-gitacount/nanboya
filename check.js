(function() {
    var sessionStorage_transfer = function(event) {
        if (!event) {
            event = window.event;
        }
        if (!event.newValue)
            return;
        if (event.key == 'getSessionStorageForNotice') {
            localStorage.setItem('sessionStorageForNotice', JSON.stringify(sessionStorage));
            localStorage.removeItem('sessionStorageForNotice');
        } else if (event.key == 'sessionStorageForNotice') {
            var data = JSON.parse(event.newValue);
            for (var key in data) {
                if (key == 'do_not_show_alert_popup') {
                    sessionStorage.setItem(key, data[key]);
                }
            }
        }
    };
    if (window.addEventListener) {
        window.addEventListener("storage", sessionStorage_transfer, false);
    } else {
        window.attachEvent("onstorage", sessionStorage_transfer);
    }
    ;if (!sessionStorage.length) {
        localStorage.setItem('getSessionStorageForNotice', 'foobar');
        localStorage.removeItem('getSessionStorageForNotice', 'foobar');
    }
    ;var nanboyaDisplayNotice = function(data) {
        if (!data)
            return false;
        if (!data.header)
            return false;
        if (!data.notices)
            return false;
        var header = data.header;
        var notices = data.notices;
        var config = data.config;
        var rejected_pages = config.rejected_pages;
        if (rejected_pages && rejected_pages.length) {
            var _rejected_pages = rejected_pages.filter(function(e) {
                return e !== "";
            }).join("|").replace('?', '\\?');
            var rejected_reg = new RegExp(_rejected_pages,'i');
            var _href = window.location.href.replace(/^.*\/\/[^\/]+/, '');
            if (_href.match(rejected_reg)) {
                return false;
            }
        }
        var excluded_pages = config.excluded_pages;
        var custom_style = config.custom_style;
        var custom_js = config.custom_js;
        var disabled_shop_list = config.disabled_shop_list;
        var disabled_shop_id_list = config.disabled_shop_id_list;
        var _categories = config.categories;
        var categories = {};
        _categories.forEach(function(c) {
            c.notices = [];
            categories[c.slug] = c;
        });
        var loc = window.location;
        var pathname = loc.pathname;
        var is_nanboya = !(loc.hostname.indexOf("brand-concier") !== -1);
        var is_brandconcier = !is_nanboya;
        var is_production = (loc.hostname == 'brand-concier.com' || loc.hostname == 'nanboya.com');
        var ua = navigator.userAgent;
        var is_smp = (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0);
        var dirs = loc.pathname.split("/").filter(function(e) {
            return e !== "";
        });
        var is_shop = dirs.includes("shop") && dirs[(dirs.length - 1)] !== 'shop';
        var is_tokyo = is_shop && dirs.includes("tokyo") && dirs[(dirs.length - 1)] == 'tokyo';
        var is_osaka = is_shop && dirs.includes("osaka") && dirs[(dirs.length - 1)] == 'osaka';
        var is_brandpage = !is_shop;
        var shopname;
        var now = new Date();
        var _valid_notices = [];
        var kaitori_sites = window.kaitori_sites || ["brand-kaitori", "gold-kaitori", "jewelry-kaitori", "tokei-kaitori", "bag-kaitori", "shokki-kaitori", "fuku-kaitori", "kottou-kaitori", "ihin-kaitori", "kitte-kaitori", "osake-kaitori", "golf-kaitori", "camera-kaitori", "gakki-kaitori", "watch-repair", "kaitorinow"];
        var kaitori_site = "";
        if (is_nanboya) {
            if (kaitori_sites.includes(dirs[0])) {
                kaitori_site = "/" + dirs[0] + "/";
            } else {
                kaitori_site = '/';
            }
        }
        if (!is_shop && excluded_pages && excluded_pages.length) {
            var _excluded_pages = excluded_pages.filter(function(e) {
                return e !== "";
            }).join("|").replace('?', '\\?');
            var reg = new RegExp(_excluded_pages,'i');
            var _href = loc.href.replace(/^.*\/\/[^\/]+/, '');
            is_brandpage = !_href.match(reg);
        }
        var unescapeHtml = function(target) {
            if (typeof target !== 'string')
                return target;
            var patterns = {
                '&lt;': '<',
                '&gt;': '>',
                '&amp;': '&',
                '&quot;': '"',
                '&#x27;': '\'',
                '&#x60;': '`'
            };
            return target.replace(/&(lt|gt|amp|quot|#x27|#x60);/g, function(match) {
                return patterns[match];
            });
        };
        notices.forEach(function(notice, index, notices) {
            if (notice.excluded_urls) {
                var excluded_urls = notice.excluded_urls.split('\n').filter(function(e) {
                    return e !== "";
                }).join("|").replace('?', '\\?');
                var reg = new RegExp(excluded_urls,'i');
                var _href = loc.href.replace(/^.*\/\/[^\/]+/, '');
                if (_href.match(reg)) {
                    return;
                }
            }
            var start_at = notice.start_at ? notice.start_at.replace(/-/g, "/") : null;
            var end_at = notice.end_at ? notice.end_at.replace(/-/g, "/") : null;
            var s = start_at ? new Date(Date.parse(start_at)) : null;
            var e = end_at ? new Date(Date.parse(end_at)) : null;
            var is_target_date = false;
            if (!s || (s && s <= now)) {
                if (!e || (e && e >= now)) {
                    is_target_date = true;
                }
            }
            if (!is_target_date)
                return false;
            var is_target_site = false;
            if (is_nanboya && notice.target.site.indexOf('nanboya.com') !== -1) {
                is_target_site = true;
            } else if (is_brandconcier && notice.target.site.indexOf('brand-concier.com') !== -1) {
                is_target_site = true;
            }
            if (!is_target_site)
                return false;
            var for_tokyo = (notice.target.var_02 == '東京都' || (Array.isArray(notice.target.var_02) && notice.target.var_02.includes("東京都")) || notice.target.var_02 == '関東' || (Array.isArray(notice.target.var_02) && notice.target.var_02.includes("関東")));
            var for_osaka = (notice.target.var_02 == '大阪府' || (Array.isArray(notice.target.var_02) && notice.target.var_02.includes("大阪府")) || notice.target.var_02 == '関西' || (Array.isArray(notice.target.var_02) && notice.target.var_02.includes("関西")));
            var rules = notice.target.__rules;
            if (!rules)
                return false;
            var is_target_page = false;
            if (rules.type == 'direct' && rules.direct_urls) {
                var urls = rules.direct_urls.split('\n').filter(function(e) {
                    return e !== "";
                }).join("|").replace('?', '\\?');
                var reg = new RegExp(urls,'i');
                var _href = loc.href;
                if (_href.match(reg)) {
                    _valid_notices.push(notice);
                    return;
                }
            } else if (is_shop && rules.type == 'shop') {
                var is_disabled_shop_page = false;
                disabled_shop_id_list.forEach(function(shop_id, index, shop_list) {
                    if (dirs.includes(shop_id)) {
                        is_disabled_shop_page = true;
                    }
                });
                if (is_disabled_shop_page)
                    return false;
                if (is_nanboya && (rules.for_all_shops || rules.for_all_nanboya_shops)) {
                    _valid_notices.push(notice);
                } else if (is_brandconcier && (rules.for_all_shops || rules.for_all_brand_concier_shops)) {
                    _valid_notices.push(notice);
                } else if ((rules.for_specified_shops || rules.for_the_prefs || rules.for_the_regions) && rules.shop_list) {
                    rules.shop_list.forEach(function(shop, index, shop_list) {
                        var shop_id = shop.id;
                        if (dirs.includes(shop_id)) {
                            _valid_notices.push(notice);
                            return;
                        }
                    });
                    if (rules.for_the_prefs || rules.for_the_regions) {
                        if (is_tokyo && for_tokyo) {
                            _valid_notices.push(notice);
                        } else if (is_osaka && for_osaka) {
                            _valid_notices.push(notice);
                        }
                    }
                }
            } else if (rules.type == 'other') {
                if (rules.site == 'all') {
                    if ((is_brandpage) || (!is_brandpage && !rules.other.only_brand_page)) {
                        _valid_notices.push(notice);
                        return;
                    }
                } else if ((rules.site == loc.hostname) || (rules.site == 'brand-concier.com' && is_brandconcier) || (rules.site == 'nanboya.com' && is_nanboya)) {
                    if (rules.other.multisite) {
                        if (rules.other.multisite == 'all') {
                            if ((!is_brandpage && !rules.other.only_brand_page) || is_brandpage) {
                                _valid_notices.push(notice);
                                return;
                            }
                        } else if (rules.other.multisite == 'brand-kaitori' && !kaitori_sites.includes(dirs[0])) {
                            if ((!is_brandpage && !rules.other.only_brand_page) || is_brandpage) {
                                _valid_notices.push(notice);
                                return;
                            }
                        } else if (dirs[0] == rules.other.multisite) {
                            if ((!is_brandpage && !rules.other.only_brand_page) || is_brandpage) {
                                _valid_notices.push(notice);
                                return;
                            }
                        }
                    } else {
                        if ((!is_brandpage && !rules.other.only_brand_page) || is_brandpage) {
                            _valid_notices.push(notice);
                            return;
                        }
                    }
                }
            }
        });
        if (_valid_notices.length) {
            _valid_notices.sort(function(a, b) {
                if (a.delivering_order >= b.delivering_order)
                    return -1;
                if (a.delivering_order < b.delivering_order)
                    return 1;
                return 0;
            });
            var insertNotices = function(notices) {
                var _intervals = [];
                var _notice_elements = [];
                var notice_elements = {
                    'append_to_body': {
                        notices: []
                    },
                    'append_into_popup': categories,
                }
                notice_elements.append_into_popup["uncategorized"] = {
                    notices: []
                };
                var show_popup = false;
                var noticeList = document.createElement('div');
                noticeList.className = 'js-notice_list';
                var noticeListWrapper = document.createElement('div');
                noticeListWrapper.className = 'js-notice_list_wrapper';
                noticeList.appendChild(noticeListWrapper);
                notices.forEach(function(notice, index, notices) {
                    var pc_content = notice.contents.pc.content;
                    var smp_content = notice.contents.smp.content;
                    var wrap_div = document.createElement("div");
                    var custom_class = notice.custom_class ? notice.custom_class : "";
                    wrap_div.className = "emergency " + custom_class;
                    wrap_div.setAttribute("data-notice", notice.uid);
                    var inner_div = document.createElement("div");
                    inner_div.className = 'e_inner';
                    var content = "";
                    if (is_smp && smp_content) {
                        content = smp_content;
                    } else {
                        content = pc_content;
                    }
                    content = content.replace(/\/%%site_dir%%\//g, kaitori_site);
                    content = content.replace(/\/%%site_dir%%/g, kaitori_site);
                    content = content.replace(/%%site_dir%%\//g, kaitori_site);
                    content = content.replace(/%%site_dir%%/g, kaitori_site);
                    inner_div.innerHTML = (unescapeHtml(content));
                    wrap_div.appendChild(inner_div);
                    _notice_elements.push(wrap_div);
                    if (notice["append_to_body"]) {
                        notice_elements.append_to_body.notices.push(wrap_div);
                    } else {
                        show_popup = true;
                        if (notice.category_slug && categories[notice.category_slug]) {
                            notice_elements.append_into_popup[notice.category_slug].notices.push(wrap_div);
                        } else {
                            notice_elements.append_into_popup['uncategorized'].notices.push(wrap_div);
                        }
                    }
                });
                if (custom_style) {
                    var style = document.createElement('style');
                    style.innerHTML = custom_style;
                    document.body.insertBefore(style, document.body.firstChild);
                }
                if (notice_elements.append_to_body.notices.length) {
                    notice_elements.append_to_body.notices.reverse().forEach(function(n) {
                        noticeListWrapper.appendChild(n);
                    });
                }
                var do_not_show_alert_popup = sessionStorage.getItem("do_not_show_alert_popup");
                if (show_popup && !do_not_show_alert_popup) {
                    var wrapper = document.createElement('div');
                    wrapper.className = 'popup_alert';
                    var popup_btn = document.createElement('p');
                    popup_btn.className = 'popup_alert__title';
                    var popup_btn_span = document.createElement('span');
                    popup_btn_span.className = 'popup_alert__title-text';
                    popup_btn_span.innerText = is_nanboya ? '感染症対策に基づく店舗営業のお知らせ' : '感染症対策に基づく店舗営業のお知らせ';
                    var popup_btn_close = document.createElement('div');
                    popup_btn_close.className = 'popup_alert__title__close';
                    var popup_btn_close_icon = document.createElement('span');
                    popup_btn_close_icon.className = 'popup_alert__title__close-icon';
                    popup_btn_close.addEventListener("click", function(e) {
                        e.stopPropagation();
                        window.sessionStorage.setItem("do_not_show_alert_popup", true);
                        document.querySelector(".popup_alert").remove();
                    });
                    popup_btn_close.appendChild(popup_btn_close_icon);
                    popup_btn_span.appendChild(popup_btn_close);
                    popup_btn.appendChild(popup_btn_span);
                    var popup_contents_wrapper = document.createElement('div');
                    popup_contents_wrapper.className = 'popup_alert_content';
                    var popup_contents_close_btn = document.createElement('div');
                    popup_contents_close_btn.className = 'popup_alert_content__close';
                    var popup_contents_close_btn_icon = document.createElement('span');
                    popup_contents_close_btn_icon.className = 'popup_alert_content__close-icon';
                    popup_contents_close_btn.appendChild(popup_contents_close_btn_icon);
                    popup_contents_wrapper.appendChild(popup_contents_close_btn);
                    _categories.forEach(function(c) {
                        var cat = notice_elements.append_into_popup[c.slug];
                        if (cat.notices && cat.notices.length) {
                            var cat_wrapper = document.createElement('div');
                            var classes = 'popup_alert_content__alert ' + c.custom_class;
                            cat_wrapper.className = classes;
                            if (c.show_title && c.title_text) {
                                var title_text = c.title_text.replace("{%site%}", is_nanboya ? 'なんぼや' : 'ブランド コンシェル');
                                var title_div = document.createElement('div');
                                title_div.className = 'popup_alert_content__alert-title';
                                title_div.innerText = title_text;
                                cat_wrapper.appendChild(title_div);
                            }
                            var ul = document.createElement('ul');
                            ul.className = 'popup_alert_content__alert-list';
                            cat.notices.reverse().forEach(function(n) {
                                var li = document.createElement('li');
                                li.className = 'popup_alert_content__alert-list-item';
                                li.appendChild(n);
                                ul.appendChild(li);
                            });
                            cat_wrapper.appendChild(ul);
                            popup_contents_wrapper.appendChild(cat_wrapper);
                        }
                    });
                    notice_elements.append_into_popup["uncategorized"].notices.reverse().forEach(function(n) {
                        popup_contents_wrapper.appendChild(n);
                    })
                    wrapper.appendChild(popup_btn);
                    wrapper.appendChild(popup_contents_wrapper);
                    var bg_shadow = document.createElement('div');
                    bg_shadow.className = 'popup_alert_content__bg-shadow';
                    wrapper.appendChild(bg_shadow);
                    noticeListWrapper.insertBefore(wrapper, noticeListWrapper.firstChild);
                }
                if (custom_js) {
                    var script = document.createElement('script');
                    script.innerHTML = custom_js;
                    noticeList.appendChild(script);
                }
                if (is_nanboya && window.hasOwnProperty('is_2022_renewal_responsive') && is_2022_renewal_responsive) {
                    var appendNoticeToHeadLines = function() {
                        var childNodes = noticeListWrapper.childNodes;
                        if (childNodes.length >= 1) {
                            for (var i = 0; i < childNodes.length; i++) {
                                if (childNodes[i].nodeType !== 3) {
                                    childNodes[i].className += " swiper-slide";
                                }
                            }
                            noticeList.className += ' notice_list-swiper';
                            noticeListWrapper.className += ' swiper-wrapper';
                            var headline_wrappers = document.querySelectorAll(".header__headline");
                            if (headline_wrappers.length) {
                                headline_wrappers.forEach(function(el) {
                                    while (el.lastElementChild) {
                                        el.removeChild(el.lastElementChild);
                                    }
                                    let cloned = noticeList.cloneNode(true);
                                    el.appendChild(cloned);
                                })
                            }
                            var initSwiper = function() {
                                const noticeListSwiper = new Swiper('.notice_list-swiper',{
                                    loop: true,
                                    direction: "vertical",
                                    autoplay: {
                                        delay: 5000,
                                    },
                                });
                            }
                            if (window.hasOwnProperty('Swiper') && childNodes.length > 1) {
                                initSwiper();
                            } else {
                                if (document.readyState == 'loading') {
                                    document.addEventListener('DOMContentLoaded', function() {
                                        initSwiper();
                                    });
                                }
                            }
                        }
                    }
                    if (document.readyState == 'loading') {
                        appendNoticeToHeadLines();
                    } else {
                        appendNoticeToHeadLines();
                    }
                } else {
                    if (document.readyState == 'loading') {
                        document.body.insertBefore(noticeList, document.body.firstChild);
                    } else {
                        document.body.insertBefore(noticeList, document.body.firstChild);
                    }
                }
            };
            insertNotices(_valid_notices);
            if (document.readyState === "complete") {
                if (window.hasOwnProperty("sidePos")) {
                    sidePos();
                }
            }
        }
    };
    window.nanboyaDisplayNotice = nanboyaDisplayNotice;
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function(searchElement, fromIndex) {
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }
                var o = Object(this);
                var len = o.length >>> 0;
                if (len === 0) {
                    return false;
                }
                var n = fromIndex | 0;
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                while (k < len) {
                    if (o[k] === searchElement) {
                        return true;
                    }
                    k++;
                }
                return false;
            }
        });
    }
    (function() {
        var loc = window.location;
        var pathname = loc.pathname;
        var is_nanboya = !(loc.hostname.indexOf("brand-concier") !== -1);
        var is_brandconcier = !is_nanboya;
        var is_production = (loc.hostname == 'brand-concier.com' || loc.hostname == 'nanboya.com');
        var now = new Date();
        var timestamp = new Date(now.getFullYear().toString() + "/" + (now.getMonth() + 1).toString() + "/" + now.getDate().toString() + " " + now.getHours().toString() + ":" + now.getMinutes().toString() + ":00").getTime();
        var script = document.createElement('script');
        if (is_nanboya) {
            var host = loc.hostname;
        } else if (is_brandconcier && is_production) {
            var host = 'nanboya.com';
        } else {
            var host = 'stg.nanboya.com';
        }
        script.src = "//" + host + "/ajax/nanboya-notice-management/notices.json.js" + "?ver=" + timestamp;
        script.async = 1;
        document.head.appendChild(script);
    }
    )();
}
)();
