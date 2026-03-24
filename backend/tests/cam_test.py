# cam_test.py
import cv2
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
print("ret:", ret)
if ret:
    cv2.imshow("test", frame)
    cv2.waitKey(2000)
cap.release()
cv2.destroyAllWindows()
#test