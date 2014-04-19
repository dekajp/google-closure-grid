/*
Require JS - so that deps.js can be build by closurebuilder.py
*/
goog.provide('pear');
goog.provide('pear.ui');
goog.provide('pear.plugin');
goog.provide('pear.data');
goog.provide('pear.fx');

goog.require('pear.plugin.ColumnMove');
goog.require('pear.plugin.FilterMenu');
goog.require('pear.plugin.FooterStatus');
goog.require('pear.plugin.HeaderMenu');
goog.require('pear.plugin.Pager');

goog.require('pear.ui.Grid');