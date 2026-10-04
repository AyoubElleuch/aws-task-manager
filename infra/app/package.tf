data "archive_file" "health" {
  type        = "zip"
  output_path = "${path.module}/health.zip"

  source {
    content  = file("${path.module}/../../backend/dist/main.js")
    filename = "main.mjs"
  }
}