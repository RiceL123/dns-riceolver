#! /bin/dash

############################################################
#                                                          #
#   COMP3331/COMP9331 Computer Networks and Applications   #
#   DNS Assignment                                         #
#   Script to test client multiplexing                     #
#                                                          #
#   Author: Tim Arney (t.arney@unsw.edu.au)                #
#   Date:   19/07/2023                                     #
#                                                          #
############################################################

usage() {
    cmd=$(basename "$0")
    echo "usage: $cmd <lang> <numclients> <sleep> <clientarg1> ... <clientargN>" >&2
    echo >&2
    echo "         lang:    c, java, python2, python3" >&2
    echo "   numclients:    number of clients to spawn" >&2
    echo "        sleep:    delay between spawning clients" >&2
    echo "   clientargi:    command-line arguments to pass to client" >&2
    echo >&2
    echo "   ex: $cmd c 5 1 127.0.0.1 5300 www.example.com" >&2
    echo "       - looks for a C executable client" >&2
    echo "       - spawns 5 instances, 1 second apart" >&2
    echo "       - passes each \"127.0.0.1 5300 www.example.com\"" >&2
    echo "         as command-line arguments" >&2
    exit 1
}

if [ "$#" -lt 6 ]
then
    usage
fi

lang="$1"
shift
numclients="$1"
shift
delay="$1"
shift
clientargs="$*"

case "$lang" in
    "c")
        if [ ! -x "client" ]
        then
            echo "error: no 'client' executable found, has it been compiled?"
            exit 1
        fi
        client="./client"
        ;;
    "java")
        if [ ! -f "Client.class" ]
        then
            echo "error: no 'Client.class' found, has it been compiled?"
            exit 1
        fi
        client="java Client"
        ;;
    "python2")
        if [ ! -f "client.py" ]
        then
            echo "error: no 'client.py' found"
            exit 1
        fi
        client="python client.py"
        ;;
    "python3")
        if [ ! -f "client.py" ]
        then
            ls
            echo "error: no 'client.py' found"
            exit 1
        fi
        client="python3 client.py"
        ;;
    *)
        echo "error: unrecognised language: ${lang}\n" >&2
        usage
        ;;
esac

i=1
pids=
echo "\nspawning clients...\n"

while [ "$i" -le "$numclients" ]
do
    out="client${i}.out"
    echo "${i}. $client $clientargs > $out &"
    eval "$client $clientargs" > "$out" &
    pids="$pids $!"
    sleep "$delay"
    i=$((i+1))
done

i=1
echo "\nwaiting for clients...\n"

for pid in $pids
do
    echo "${i}. wait for pid $pid"
    wait "$pid"
    i=$((i+1))
done

i=1
echo "\nclient output...\n"

while [ "$i" -le "$numclients" ]
do
    out="client${i}.out"

    if [ ! -f "$out" ]
    then
        echo "error: '${out} not found'" >&2
        continue
    fi

    if [ "$i" -gt 1 ]
    then
        echo
    fi

    echo "==> $out <=="
    cat "$out"
    i=$((i+1))
done
