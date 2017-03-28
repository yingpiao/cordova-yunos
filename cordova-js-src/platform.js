/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

const BACK_KEYCODE = 27;

module.exports = {
    id: 'yunos',

    bootstrap: function() {
        var modulemapper = require('cordova/modulemapper');
        var channel = require('cordova/channel');
        var exec = require('cordova/exec');

        exec.init();

        modulemapper.clobbers('cordova/exec/proxy', 'cordova.commandProxy');

        channel.onNativeReady.fire();

        // Inject a listener for the backbutton on the document.
        var backKeyEventListener = function(e) {
            if (e.keyCode == BACK_KEYCODE) {
                cordova.fireDocumentEvent('backbutton');
                e.preventDefault();
            }
        };

        var backButtonChannel = cordova.addDocumentEventHandler('backbutton');
        backButtonChannel.onHasSubscribersChange = function() {
            // If we just attached the first handler or detached the last handler,
            // let native know we need to override the back button.
            var isOverride = this.numHandlers === 1;
            // Register key event in Domono mode.
            // TODO: Receive backbutton event from page in agil-webview mode.
            if (isOverride) {
                document.addEventListener('keyup', backKeyEventListener);
            } else {
                document.removeEventListener('keyup', backKeyEventListener);
            }
        };

        // Receive Pause/Resume events from W3C API instead of YunOS Page API.
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                channel.onPause.fire();
            } else {
                channel.onResume.fire();
            }
        }, false);

    // End of bootstrap
    }
};
