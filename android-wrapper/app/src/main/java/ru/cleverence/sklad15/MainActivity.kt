package ru.cleverence.sklad15

import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkRequest
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.widget.Button
import android.widget.Toast
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var settingsButton: Button
    private val mainHandler = Handler(Looper.getMainLooper())
    private var lastLoadFailed = false
    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        settingsButton = findViewById(R.id.btn_open_settings)
        configureWebView(webView)

        settingsButton.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        if (!AppPrefs.hasCustomUrl(this)) {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        webView.loadUrl(AppPrefs.getPwaUrl(this))
        setupNetworkRetry()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    private fun configureWebView(view: WebView) {
        val settings = view.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        view.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError
            ) {
                if (request.isForMainFrame) {
                    lastLoadFailed = true
                    scheduleRetry("Нет сети. Повтор загрузки...")
                }
            }
        }
        view.webChromeClient = WebChromeClient()
    }

    private fun scheduleRetry(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        mainHandler.removeCallbacksAndMessages(null)
        mainHandler.postDelayed({
            if (lastLoadFailed) {
                webView.loadUrl(AppPrefs.getPwaUrl(this))
            }
        }, 5000)
    }

    private fun setupNetworkRetry() {
        connectivityManager = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                if (lastLoadFailed) {
                    runOnUiThread {
                        lastLoadFailed = false
                        webView.loadUrl(AppPrefs.getPwaUrl(this@MainActivity))
                    }
                }
            }
        }
        networkCallback = callback
        val request = NetworkRequest.Builder().build()
        connectivityManager?.registerNetworkCallback(request, callback)
    }

    override fun onResume() {
        super.onResume()
        webView.loadUrl(AppPrefs.getPwaUrl(this))
    }

    override fun onDestroy() {
        super.onDestroy()
        networkCallback?.let { connectivityManager?.unregisterNetworkCallback(it) }
        mainHandler.removeCallbacksAndMessages(null)
    }
}
