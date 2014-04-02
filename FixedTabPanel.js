;(function (window, document, $, _, undefined) {

var app = this;
app.$win = app.$win || $(window);
var $html = $('html');
var $body = $('body');
var $scrollable = $('html, body');

var nameSpace = 'iosList';
var events = Modernizr.touch ? 'scroll.' + nameSpace + ' touchmove.' + nameSpace + ' touchend.' + nameSpace + ' touchstart.' + nameSpace : 'scroll.' + nameSpace;

// -----------------------------------------------------------------------------

var TabPanel = function(el) {
    var self = this instanceof TabPanel
             ? this
             : Object.create(TabPanel.prototype);

    self.el = el;
    self.$el = $(el);

    self.initialize();

    return self;
};

TabPanel.prototype.initialize = function() {
    var self = this;

    //Fixed tab panel and animated nav is not supported for IE8 so we will gracefully degrade
    if (!$html.hasClass('lt-ie9')) {
        // page and images are loaded, in order to make the correct calculation
        app.$win.on('load', _.bind(self.initTabPanel, this));
        app.$win.on('resize', _.throttle($.proxy(self.handleResizeEvent, this), 100));
    } else {
        // Tab Panel Support for older browsers
        self.initFallBackTabPanelSupport();
    }

};

TabPanel.prototype.initTabPanel = function initTabPanel() {
    var self = this;

    // Create tab panel placeholder to account for height when fixed
    $body.prepend("<div class='global-tab-placeholder'></div>");

    self.$placeholder = $(".global-tab-placeholder");

    self.dockTabPanel();
    self.addJumpLinkCategories();
};

TabPanel.prototype.resetTabPanel = function resetTabPanel() {
    var self = this;

    $body.removeClass('dock-tab-panel');
    self.$placeholder.css("height", "auto");
    app.$win.scrollTop(0);
}

TabPanel.prototype.calculateTabPanelPosition = function calculateTabPanelPosition() {
    var winPosition;
    var $self = $(self);
    var tabPanelClass;

    winPosition = this.isDesktop ? $self.scrollTop() + this.pageHeaderHeight : $self.scrollTop();

    if (winPosition >= this.scrollPos) {
      $body.addClass('dock-tab-panel');
      this.$placeholder.css("height", this.placeHolderHeight);
    } else {
      $body.removeClass('dock-tab-panel');
      this.$el.css("bottom", "auto");
      this.$placeholder.css("height", "auto");
    }
}

TabPanel.prototype.dockTabPanel = function dockTabPanel() {
    var self = this;
    var $pageHeader = $(".page-header");

    self.isDesktop = Response.band(1024);

    self.pageHeaderHeight = $pageHeader.height();
    self.scrollPos = self.$el.offset().top;
    self.placeHolderHeight =  self.isDesktop ? self.pageHeaderHeight : self.$el.outerHeight();

    // !Possible fix for lagging on mobile, need to revisit this issue in the future
    //app.$win.on(events, _.bind(self.calculateTabPanelPosition, this));

    app.$win.on('scroll', _.bind(self.calculateTabPanelPosition, this));
};

TabPanel.prototype.addJumpLinkCategories = function addJumpLinkCategories() {
    var self = this;
    var $categoryBlock = $("[data-tab-category]");

    $categoryBlock.each(function(idx) {
        var $this = $(this);
        idx = idx + 1;
        $this.attr("data-tab-id", idx);
    });

    self.bindTabPanelLinks();
};

TabPanel.prototype.getOffsetPosition = function getOffsetPosition() {
    var self = this;
    var tabPanelPadding = 40; // Update this to appopriate space that you want above fixed category
    var tabPanelHeight = self.$el.outerHeight();
    var getOffsetPositionValue;

    if (self.isDesktop) {
        // 1024 > Header is fixed so we need to account for that height
        getOffsetPositionValue = tabPanelHeight + self.pageHeaderHeight + tabPanelPadding;
    } else {
        getOffsetPositionValue = tabPanelHeight + tabPanelPadding
    }

    return getOffsetPositionValue;
};

TabPanel.prototype.bindTabPanelLinks = function bindTabPanelLinks() {
    var self = this;
    var offsetPosition = 0;
    var $tabPanelLink = $("[data-tab-panel-link]");

    $tabPanelLink.off(); // Clear old events

    // Get scroll position to offset category tab postion from
    offsetPosition = self.getOffsetPosition();

    $tabPanelLink.each(function(idx) {
        var $this = $(this);
        var tabCategoryPos = 0;

        idx = idx + 1;
        
        var $tabCategory = $("[data-tab-id='" + idx + "']");
        var tabCategoryPosTop = $tabCategory.position().top;

        tabCategoryPos = tabCategoryPosTop - offsetPosition;

        $this.on("click", function() {
            var $self = $(this);
            $tabPanelLink.removeClass("active-tab-link");
            $self.addClass("active-tab-link");
            self.scrollTo(tabCategoryPos);
            return false;
        });

    });
};

TabPanel.prototype.scrollTo = function scrollTo(tabCategoryPos) {
    var self = this;

    scrollPos = tabCategoryPos;

    // scroll to tab panel category
    $scrollable.animate({
        scrollTop: scrollPos
    }, 500);

    return false;
};

TabPanel.prototype.handleResizeEvent = function handleResizeEvent() {
    var self = this;

    self.resetTabPanel();

    setTimeout(function() {
        self.dockTabPanel();
        self.bindTabPanelLinks();
    }, 500);
}

TabPanel.prototype.initFallBackTabPanelSupport = function initFallBackTabPanelSupport() {
    var $categoryBlock = $("[data-tab-category]");
    var $tabPanelLink = $("[data-tab-panel-link]");

    // Add id attribute to each category block
    $categoryBlock.each(function(idx) {
        var $this = $(this);
        idx = idx + 1;
        $this.attr("id", "tab-id-" + idx);
    });

    // Add page anchor of category block id
    $tabPanelLink.each(function(idx) {
        var $this = $(this);
        idx = idx + 1;
        $this.attr("href", "#" + "tab-id-" + idx);
    });
};

return app.TabPanel = TabPanel;

// -----------------------------------------------------------------------------
}).call(window.SPC = window.SPC || {}, window, document, jQuery, _);

