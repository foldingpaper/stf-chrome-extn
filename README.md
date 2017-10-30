Simple Tab Finder - Chorme Extension
=====================================

Simple Tab Finder is a simple tab navigation brower extension for Google Chrome.
Helps you quickly find and go to your open tabs by title and url.
 
Functionality
-------------

- lists all the open tabs across all windows
- simple substring based search to filter the list
- - searches tab title and url
- click to open
- keyboard navigation with <up> and <down> arrows followed 
  by <enter> to open tab
- tries to blend with Chrome for integrated experience


Simple
--------

This does nothing more than just helping navigate to right tab! 

Does NOT 
- add/modify any content on pages you visit or modify anything on websites.
- collect any browsing data (other than google analytics usage).
- use local storage
- use complex fuzzy search


Short-cut Key
-------------

Chrome supports assigning a shortcut key to activate extensions.
Please look for the Keyboard shortcuts at the bottom right of the
chrome://extensions page to assign your preferred shortcut,
e.g. Shift+Cmd+Space.


Screenshots
-----------

The screenshot shows:

- popup when Tab Finder activated
- with a search term filter the list
- and a bubble popup showing the URL where match found

![Tab Finder Screenshot](screenshots/tabfinder.png)


Source code
-----------

[github](http://github.com/skandg/tabfinder-chrome-extenstion)


Package
-------

`zip -r stf_0.1.8.zip app`

Todo
----

- Proper build

Version
-------
0.1.8: Fix some css
0.1.7: Delay GA call which was slowing startup, show tab count, other refactoring
0.1.6: Google Analytics, rounded square icon, and blue screenshots
0.1.5: updated logo and promo
0.1.4: fix packaging
0.1.3: update keyboard handling for scroll to focus
0.1.2: many changes
0.1.1: initial version
