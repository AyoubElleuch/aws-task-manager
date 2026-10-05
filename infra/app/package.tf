data "archive_file" "health" {
  type        = "zip"
  output_path = "${path.module}/health.zip"

  source {
    content  = file("${path.module}/../../backend/dist/main.js")
    filename = "main.mjs"
  }
}

data "archive_file" "me" {
  type        = "zip"
  output_path = "${path.module}/me.zip"

  source {
    content  = file("${path.module}/../../backend/dist/me.js")
    filename = "me.mjs"
  }
}
