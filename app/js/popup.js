// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var MAX_TABS_SEARCH_RESULTS=200;
var TAB_HEIGHT=41; // assume a default in px
var TAB_TEMPLATE;

// Traverse and display the tabs list
function reItemMatcher(obj, search) {
  // init
  obj.match = {};
  obj.match.highlight = {};
  obj.match.highlight.title = obj.title;
  obj.match.highlight.url = obj.url;

  // skip if empty
  var searchStr = search.trim();
  if (searchStr.length == 0) {
    return true;
  }

  var re = new RegExp(searchStr, 'i');
  var titleMatchIndex = obj.title.search(re);
  var urlMatchIndex = obj.url.search(re);
  var match = titleMatchIndex >= 0 || urlMatchIndex >= 0;
  if (match) {
    obj.match = {};
    obj.match.highlight = {};
    obj.match.highlight.title = obj.title;
    obj.match.highlight.url = obj.url;
    if (titleMatchIndex >= 0) {
      obj.match.highlight.title =
        highlight(obj.title, titleMatchIndex, searchStr.length + titleMatchIndex);
    }
    if (urlMatchIndex >= 0) {
      obj.match.highlight.url = 
        highlight(obj.url, urlMatchIndex, searchStr.length + urlMatchIndex);
    }
  }
  return match;
}

function reMatcher(tabs, search) {
  return $.grep(tabs, function(o) {
    return reItemMatcher(o, search);
  });
}

function highlight(string, start, end) {
  return string.substring(0, start) 
    + '<b>' + string.substring(start, end)
    + '</b>' + string.substring(end);
}

var matcher = {};
matcher['default'] = reMatcher;
matcher['re'] = reMatcher;

function showTabs(search) {
  var queryInfo = {}
  var searchStr = search.trim();
  chrome.tabs.query(queryInfo, function(tabs) {
    var matched = matcher['default'](tabs, searchStr)
    if (matched && matched.length > 0) {
      $.each(matched, renderTab);
      renderResultsCount(matched.length);
      focusFirst();
    } else {
      renderNoResults();
    }
  });
}

function resize() {
  var max_height = TAB_HEIGHT*13.5;
  var tab_count = $('.item').length;
  var new_height = TAB_HEIGHT*tab_count;
  var h = Math.min(new_height, max_height);
  $('#tabs').outerHeight(h);

  $('.item').click(function() {
    switchTab(this.id);
  });
}

function renderTab(i, tab) {
  var t = tab;
  if (!t.match.highlight.url) {
    t.match.highlight.url = 'No url';
  }
  if (!t.match.highlight.title) {
    t.match.highlight.title = 'No title';
  }
  // render the templates
  if (i>=MAX_TABS_SEARCH_RESULTS) return;
  var renderedTab = Mustache.render(TAB_TEMPLATE, t)
  $('#tabs').append(renderedTab);
}

function renderResultsCount(count) {
  var searchField_jq = $('#search');
  searchField_jq.attr('placeholder',
    'Search your ' + count + ' open tabs');
  var searchStr = searchField_jq.val().trim();
  if (searchStr === '') {
    searchField_jq.val(searchStr);
  }
}

function renderNoResults() {
  // render the templates
  var tabTemplate = $("#no-match-template").html();
  var renderedTab = Mustache.render(tabTemplate, {})
  $("#tabs").append(renderedTab);
}

function switchTab(tabid) {
  chrome.tabs.update(1*tabid, { active: true }, function(tab) {
    if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
      chrome.windows.update(tab.windowId, { focused: true });
    }
    return window.close();
  });
}

var focusIndex = -1;
function focusNext() {
  var tabs = $('.item').toArray();
  var tabcount = tabs.length
  if (focusIndex < tabs.length-1) {
    jQuery(tabs[focusIndex]).removeClass('focus');
    focusIndex = (focusIndex+1) % tabcount;
    jQuery(tabs[focusIndex]).addClass('focus');
    scrollToFocus();
  }
}
function focusPrev() {
  var tabs = $('.item').toArray();
  var tabcount = tabs.length
  if (focusIndex > 0) {
    jQuery(tabs[focusIndex]).removeClass('focus');
    focusIndex = (tabcount + focusIndex-1) % tabcount;
    jQuery(tabs[focusIndex]).addClass('focus');
    scrollToFocus();
  }
}
function focusFirst() {
  focusIndex = 0;
  $('.item').first().addClass('focus');
}
function scrollToFocus() {
  var ele = $(".focus");

  var eleTop = ele.offset().top;
  var eleHeight = ele.outerHeight(true);

  var tabsEle = $('#tabs');
  var scroll_top = tabsEle.scrollTop();
  var view_height = tabsEle.innerHeight();

  if (eleTop < eleHeight) {
    // up by one if our element is at least partially out at top
    $('#tabs').animate({scrollTop: scroll_top - eleHeight}, 10);
    return false;
  } else if (eleTop + eleHeight > view_height) {
    // down by one if our element is at least partially out at bottom
    $('#tabs').animate({scrollTop: scroll_top + eleHeight}, 10);
    return false;
  }
  return true;
}

function switchToFocussed() {
  var tabs = $('.item').toArray();
  var tabcount = tabs.length
  switchTab(jQuery(tabs[focusIndex]).attr('id'));
}

function refreshTabs() {
  val = $('#search').val();
  var tabs = $('#tabs');
  tabs.hide();
  tabs.empty();
  showTabs(val);
  tabs.show();
  // let the tabs show before we resize
  setTimeout(resize, 100);
}

function isMetaKey(code) {
  meta = [91, 18, 16];
  return meta.indexOf(code) > -1;
}

function searchKeyUp(e) {
    // using keyup to skip meta/ctrl keys
    if (isMetaKey(e.keyCode)) {
      return;
    } else if (e.keyCode == 38 || e.keyCode == 40) { 
      // down/up handled different
      return;
    }
    refreshTabs();
}

function documentKeyDown(e) {
    if (e.keyCode == 38) { // up
      focusPrev();
      e.stopPropagation();
      return false;
    } else if (e.keyCode == 40) { // down
      focusNext();
      e.stopPropagation();
      return false;
    } else if (e.keyCode == 13) { // enter
      e.stopPropagation();
      e.preventDefault();
      switchToFocussed();
      return false;
    }
}

function readyFunction() {
  $('#search').keyup(searchKeyUp);
  $(document).keydown(documentKeyDown);

  // lets display default results
  refreshTabs();
}

$(document).ready(function() {
  TAB_TEMPLATE = $("#tab-template").html();
  readyFunction();
});

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-93674868-1']);
_gaq.push(['_trackPageview']);

setTimeout(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';

  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
}, 1000);
