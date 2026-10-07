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


data "archive_file" "projects" {
  type        = "zip"
  output_path = "${path.module}/projects.zip"

  source {
    content  = file("${path.module}/../../backend/dist/projects.cjs")
    filename = "projects.cjs"
  }
}

data "archive_file" "milestones" {
  type        = "zip"
  output_path = "${path.module}/milestones.zip"

  source {
    content  = file("${path.module}/../../backend/dist/milestones.cjs")
    filename = "milestones.cjs"
  }
}

data "archive_file" "tasks" {
  type        = "zip"
  output_path = "${path.module}/tasks.zip"

  source {
    content  = file("${path.module}/../../backend/dist/tasks.cjs")
    filename = "tasks.cjs"
  }
}
