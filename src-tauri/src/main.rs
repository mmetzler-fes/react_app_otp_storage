// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Disable GTK Overlay Scrolling to force visible scrollbars on Linux
  std::env::set_var("GTK_OVERLAY_SCROLLING", "0");
  app_lib::run();
}
