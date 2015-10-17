#!/bin/bash

if [ "$1" == "" ]
then
  echo provide filename
  exit
fi

z=`tempfile`

cat $1 | sed 's/"image":".*\\\//"image":"/' > $z ; mv $z $1
