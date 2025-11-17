#!/bin/bash
cd /home/kavia/workspace/code-generation/edusphere-learning-platform-254086-254116/frontend_edusphere
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

