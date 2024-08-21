import time

def wait_for_short_time(seconds):

    print(f"Waiting for {seconds} seconds...")
    time.sleep(seconds)
    print("Done waiting.")

wait_for_short_time(10)