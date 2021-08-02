#!/usr/bin/env python
# -*- coding: utf-8 -*-

import subprocess
import time
from random import randint

events = ['xdotool key ctrl+Tab','xdotool key Super_L+Tab','xdotool key Up','xdotool key Down','xdotool key Down','xdotool key Down','xdotool key Up','xdotool key Up', 'xdotool key ctrl+Tab','xdotool key Up','xdotool key Down','xdotool key F5', 'xdotool key Up', 'xdotool key Down']

while True: 
    rand_event = randint(0, len(events)-1)  
    subprocess.call(events[rand_event],  shell=True)    
    time.sleep(randint(5,20))   
    subprocess.call(["xdotool", "mousemove", str(randint(100,999)), str(randint(100,999))]) 
    subprocess.call(["xdotool", "mousemove", str(randint(100,999)), str(randint(100,999)), "click", "1"])   
    time.sleep(randint(5,10))   
    subprocess.call(["xdotool", "mousemove", str(randint(100,999)), str(randint(100,999))]) 
    subprocess.call(["xdotool", "mousemove", str(randint(100,999)), str(randint(100,999)), "click", "1"])   
    time.sleep(randint(5,10))   
    subprocess.call(["xdotool", "mousemove",str(randint(100,999)), str(randint(100,999))])  
    time.sleep(randint(0,5))    
    subprocess.call(["xdotool", "mousemove", str(randint(100,999)), str(randint(100,999)), "click", "1"])   
    time.sleep(randint(5,10))