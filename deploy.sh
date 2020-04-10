#!/bin/bash
cd ~/projects/flash-cards
git stash
git checkout master
git pull
npm install
npm run build
sudo systemctl restart flashcards
