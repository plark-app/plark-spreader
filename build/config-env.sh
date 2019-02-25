#!/usr/bin/env bash

NODE_ENV=production
APP_ENV=production

mkdir -p /nmt/plark-spreader && \
mkdir -p /var/log/plark-spreader && \
mkdir -p /var/log/plark-spreader/web

sudo chmod 777 -R /var/log/plark-spreader && \
sudo chmod 777 -R /mnt/plark-spreader
