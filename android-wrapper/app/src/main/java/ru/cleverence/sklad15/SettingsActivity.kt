package ru.cleverence.sklad15

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val input = findViewById<EditText>(R.id.input_url)
        val save = findViewById<Button>(R.id.btn_save_url)

        input.setText(AppPrefs.getPwaUrl(this))

        save.setOnClickListener {
            val rawUrl = input.text.toString().trim()
            if (!isValidUrl(rawUrl)) {
                Toast.makeText(this, getString(R.string.settings_invalid_url), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            AppPrefs.setPwaUrl(this, rawUrl)
            finish()
        }
    }

    private fun isValidUrl(url: String): Boolean {
        return (url.startsWith("http://") || url.startsWith("https://")) && url.length >= 8
    }
}
