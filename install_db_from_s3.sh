#!/bin/bash
# The Elastic Beanstalk instance has permission to read, but not write,
# to s3://research-ready/db-snapshots/
aws s3 cp s3://research-ready/db-snapshots/2020-09-22-from-Keagan database.db
# sudo is needed when logged in as ec2-user.
sudo mkdir -p /var/app/current/static/db/new_09_17_2020/
# Use the path specified in config.py
sudo mv database.db /var/app/current/static/db/new_09_17_2020/
# Change new directory and database to be owned by webapp user:group
sudo chown -R webapp:webapp /var/app/current/static/db/
# Take a look and see if everything is in order.
ls -l /var/app/current/static/db/new_09_17_2020/
