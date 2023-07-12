# Project to study about micro services

# Goals

## Step 1

- [X] Service `api` should receive a http request, get the payload and post it on a queue called "image"
- [X] Service `image-processor` should listening the "image" queue and print when a new message arrives

## Step 2

- [X] Service `api` should receive an image by http request and pass it to a queue called "image" (study the best way to pass files between micro services, base64, buffer, stream, etc)
- [X] Service `image-processor` should listening the "image" queue, get the received image and transform it to a file and save on dir `files/images`

## Step 3

- [ ] Service `image-processor` should add text or watermark to image passed from the `api`
