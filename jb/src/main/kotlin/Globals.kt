package com.codestream

import com.google.gson.Gson

val gson = Gson()
val DEBUG =
    java.lang.management.ManagementFactory.getRuntimeMXBean().inputArguments.toString().contains("-agentlib:jdwp")
        || System.getProperty("com.codestream.debug")?.equals("true") ?: false
val WEBVIEW_PATH = System.getProperty("com.codestream.webview")
