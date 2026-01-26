package ru.cleverence.sklad15

import android.content.Context

object AppPrefs {
    private const val PREFS_NAME = "sklad15_prefs"
    private const val KEY_PWA_URL = "pwa_url"

    fun getPwaUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_PWA_URL, null)
        return saved ?: context.getString(R.string.app_home_url)
    }

    fun setPwaUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_PWA_URL, url).apply()
    }

    fun hasCustomUrl(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.contains(KEY_PWA_URL)
    }
}
