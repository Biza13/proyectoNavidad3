#creamos el repositorio ecr
resource "aws_ecr_repository" "repositorio_ecr" {
  name = var.ecr

  tags = {
    "Name"        = "repositorio"
    "Environment" = "Production"
  }
}

# Referencia al rol IAM existente en mi cuenta de aws que es (LabRole) usando su ARN
data "aws_iam_role" "labrole" {
  name = "LabRole" 
}

#definición de la tarea de ecs
resource "aws_ecs_task_definition" "apache_tarea" {

  #familia a la que pertenece la tarea
  family                = "apache-tarea"

  execution_role_arn    = data.aws_iam_role.labrole.arn
  task_role_arn         = data.aws_iam_role.labrole.arn 

  # Modo de red para Fargate
  network_mode          = "awsvpc"  
  requires_compatibilities = ["FARGATE"]

  # Especificar recursos a nivel de la tarea
  cpu                      = "512"
  memory                   = "1024"
  
  container_definitions = jsonencode([
    { # Primer contenedor (Apache, para la página web)
      name      = "apache-container"
      image     = "${aws_ecr_repository.repositorio_ecr.repository_url}:img-apachenodenpm"
      essential = true
      memory = 512
      cpu = 256

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
    },

    { # Segundo contenedor (API JSON)
      name      = "json-api-container"
      image     = "${aws_ecr_repository.repositorio_ecr.repository_url}:img-jsonserver"
      essential = true 
      memory = 512
      cpu = 256

      portMappings = [
        {
          containerPort = 3000  # Puerto donde se expone el primer archivo JSON (usuarios.json)
          hostPort      = 3000
          protocol      = "tcp"
        },
        {
          containerPort = 3001  # Puerto donde se expone el segundo archivo JSON (ales.json)
          hostPort      = 3001
          protocol      = "tcp"
        },
        {
          containerPort = 3002  # Puerto donde se expone el tercer archivo JSON (stouts.json)
          hostPort      = 3002
          protocol      = "tcp"
        }
      ]
    }

  ])
}

#balanceador de carga para que siempre tengan la misma ip publica
resource "aws_lb" "balanceador" {
  name               = "balanceador-de-carga"
  internal           = false
  load_balancer_type = "application"
  security_groups   = [aws_security_group.lb_security.id]
  subnets            = [aws_subnet.subred-publica.id, aws_subnet.subred-publica-az2.id]
  enable_deletion_protection = false

  tags = {
    Name = "balanceador-de-carga"
  }
}

#listener para que el balanceador pueda escuchar las solicitudes 
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.balanceador.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "fixed-response"
    fixed_response {
      status_code = 200
      content_type = "text/plain"
    }
  }
}

#--------------------GRUPOS Y REGLAS PARA GRUPOS DE PUERTOS--------------------

#El target group es donde el ALB dirigirá el tráfico, en este caso a las tareas de las ecs que estan ejecutando mis contenedores
#este es el targer group para la web
resource "aws_lb_target_group" "apache_target_group" {
  name     = "apache-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.Desarrollo-web-VPC.id
  target_type = "ip"  #hay que poner esto porque no estamos usando ec2 sino fargate serverless

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

#regla para el contenedor de apache con la web
resource "aws_lb_listener_rule" "apache_rule" {
  listener_arn = aws_lb_listener.http.arn

  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.apache_target_group.arn 
  }

  condition {
    path_pattern {
      values = ["/"]  #ruta
    }
  }
}



# Target Group para el puerto 3000 (usuarios.json)
resource "aws_lb_target_group" "json_target_group_3000" {
  name     = "json-target-group-3000"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.Desarrollo-web-VPC.id
  target_type = "ip"  #hay que poner esto porque no estamos usando ec2 sino fargate serverless

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Regla para enrutar tráfico al puerto 3000 (usuarios.json)
resource "aws_lb_listener_rule" "json_usuarios_rule" {
  listener_arn = aws_lb_listener.http.arn

  priority     = 101 

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.json_target_group_3000.arn
  }

  condition {
    path_pattern {
      values = ["/usuarios.json"] #ruta
    }
  }
}




# Target Group para el puerto 3001 (ales.json)
resource "aws_lb_target_group" "json_target_group_3001" {
  name     = "json-target-group-3001"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.Desarrollo-web-VPC.id
  target_type = "ip"  #hay que poner esto porque no estamos usando ec2 sino fargate serverless

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Regla para enrutar tráfico al puerto 3001 (ales.json)
resource "aws_lb_listener_rule" "json_ales_rule" {
  listener_arn = aws_lb_listener.http.arn

  priority     = 102

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.json_target_group_3001.arn
  }

  condition {
    path_pattern {
      values = ["/ales.json"] #ruta
    }
  }
}



# Target Group para el puerto 3002 (stouts.json)
resource "aws_lb_target_group" "json_target_group_3002" {
  name     = "json-target-group-3002"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = aws_vpc.Desarrollo-web-VPC.id
  target_type = "ip"  #hay que poner esto porque no estamos usando ec2 sino fargate serverless

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

#Regla para enrutar tráfico al puerto 3002 (stouts.json)
resource "aws_lb_listener_rule" "json_stouts_rule" {
  listener_arn = aws_lb_listener.http.arn 

  priority     = 103 

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.json_target_group_3002.arn 
  }

  condition {
    path_pattern {
      values = ["/stouts.json"]   #ruta
    }
  }
}

#--------------------FIN GRUPOS Y REGLAS PARA GRUPOS DE PUERTOS--------------------

#crear el cluster
resource "aws_ecs_cluster" "cluster" {
  name = "ejemplo-cluster"
}

#--------------------SERVICIOS--------------------

#el servicio es donde debes asociar el Load Balancer con el servicio ECS para que las tareas puedan recibir tráfico a través de él.
#este sera el servicio para el contenedor de la pagina
resource "aws_ecs_service" "apache_service" {
  name            = "apache-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.apache_tarea.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [aws_subnet.subred-privada.id] #ponemos el servicio de la pagina en la subred privada
    security_groups = [aws_security_group.security_ecs.id]  #ponemos el grupo de seguridad de las ecs que no permiten entrada desde internet
    assign_public_ip = false  #para que no asigne una ip publica
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.apache_target_group.arn
    container_name   = "apache-container"
    container_port   = 80
  }
}

#Este sera el servicio para el contenedor json server puerto usuarios.json
resource "aws_ecs_service" "json_server_service_3000" {
  name            = "json-server-service_3000"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.apache_tarea.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [aws_subnet.subred-privada.id] #ponemos el servicio de los json en la subred privada
    security_groups  = [aws_security_group.security_ecs.id]  #ponemos el grupo de seguridad de las ecs que no permiten entrada desde internet
    assign_public_ip = false  #para que no asigne una ip publica
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.json_target_group_3000.arn
    container_name   = "json-api-container"
    container_port   = 3000
  }
}

#Este sera el servicio para el contenedor json server puerto ales.json
resource "aws_ecs_service" "json_server_service_3001" {
  name            = "json-server-service-3001"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.apache_tarea.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [aws_subnet.subred-privada.id] #ponemos el servicio de los json en la subred privada
    security_groups  = [aws_security_group.security_ecs.id]  #ponemos el grupo de seguridad de las ecs que no permiten entrada desde internet
    assign_public_ip = false  #para que no asigne una ip publica
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.json_target_group_3001.arn
    container_name   = "json-api-container"
    container_port   = 3001
  }
}

#Este sera el servicio para el contenedor json server puerto stouts.json
resource "aws_ecs_service" "json_server_service_3002" {
  name            = "json-server-service-3002"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.apache_tarea.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [aws_subnet.subred-privada.id] #ponemos el servicio de los json en la subred privada
    security_groups  = [aws_security_group.security_ecs.id]  #ponemos el grupo de seguridad de las ecs que no permiten entrada desde internet
    assign_public_ip = false  #para que no asigne una ip publica
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.json_target_group_3002.arn 
    container_name   = "json-api-container"
    container_port   = 3002
  }
}

#--------------------FIN SERVICIOS--------------------