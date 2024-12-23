git init;git add .;git commit -m '1223' ;git push origin master

운영 환경
========
bidserver 프로젝트에서 : mvn clean install; mvn spring-boot:run
포트 5천 번에서 작동
bidfront 프로젝트에서 : quasar dev 수행
quasar 프론트는 9000 포트에서 작동.
Npm install로 axios 등을 설치해야 함
DB start:port 3306


오류정보
======
-Inicis PC 결제 호출 후 세션 끊어짐, 모발의 경우 간혹 안 끊어지는 경우가 있음
-Inicis 호출을 위한 서버 jsp에서 css include가 되지 않음.
- 이니시스 네이버페이 결제시 오류(카드, 카카오페이, 토스 페이 등은 됨 아마 localhot:5000이 등록되야할지도??)
-	알림톡 토큰 획득시 오류 메시지 : ip가 권한 없음 오류류

참고사항
=======
. inicis 실제 승인 응답 전문은 프로그램 하단에 있음.
inicis결제요청 중 netcancel 상황이 발생하지 않아 현재 루틴은 테스트 안함.
. java application용 세팅은 application.yml에 정의되어 있음.(알림톡, 이니시스, SMS , jwt유효기간 등)
. jwtFilter.java ;
Filer를 skip할 url은 jwtFilter.java에 기술됨… securitConfig에서 기숳하면 작동하지 않는 경우가 있음.
. 인증코드 전송이 필요한 경우 테스트 전화번호를 임의로 넣을 수 있도록록 응답메시지에 인증코드가 보여지고 실제 전송루틴은 주석으로 처리됨.
. 회원 가입시, 전화번호(key)와 이메일은 중복을 허용하지 않는다.

입찰사용자(모든 권한 사용가능능)
=========
로그인(Login)
-	주소 : http://localhost:9000/userlogin
-	전화번호: 11111111111(11자리) 비밀번호 111을 등을 이용하여 조회
-	이를 이용하여 사용자 정보 수정, 비밀번호 변경 작업을 수행한다.

회원가입
=======
-	전화번호를 입력하고 인증번호를 발송 후 입력 내용을 제출한다.
-	비밀번호 찾기 프로그램은 전화번호 입력을 하고 재설정을 하도록 되어있다.

경기장선택(SelectVenue) 및 대회선택(SelectMatch)
-	로그인에 성공하면 경기 선택 화면으로 이동
-	대회를 선택하면 입찰 현황으로 이동함

입찰 및 입찰현황(Bidseats)
-	대회 선택에서 입찰 중이라고 표시되는 경기에서 입찰을 진행할 수 있다. (아름 체육관 경기번호 7번)
-	입찰내용이 조회되고 한 건에 여러 번 입찰을 한 경우 이력보기 버튼을 눌러서 이력을 조회한다.
-	입찰중인 대회는 좌석을 누르고 금액을 입력한 후 제출하여 입찰한다.한번에 5개 좌석 입찰이 가능함
-	화면상의 좌석은 html에서 생성된 좌석으로 현재 40로 구성됨
-	좌석별 가격이 있는 경우에는 그 가격이 기준 가격이 된다.
-	좌석별 가격이 입력되어 있지 않아도 진행이 가능하다.
-	이미 입찰된 내용이 있는 경우에는 최고가가 새로운 입찰의 기준가격이 된다.
-	입찰금액은 기준 가격보다 커야 한다.
-	입찰을 제출하면 각각의 좌석별로 등록성공/실패 여부가 표시된다.
-	화면상의 기준가격보다 큰 금액을 입력하여 제출하더라도 그 사이에 다른 사용자가 더 큰 가격으로 등록에 성공하면 등록실패가 표시된다.

낙찰결과 결제(Bidseats)
-	같은 화면에서
-	경기가 종료되고 낙찰된 경우 지불이 가능하다(금액이 100원이상으로 결제테스트가 가능하므로 매송실내체육관 선택 후 경기번호 1 혹은 2로 결제를 한다.)
-	결제 진행 버튼을 누르면 결제 진행 화면과 승인 화면이 나타난다. 두화면은 JSP로 구현되어 있어 화면은 Bid프로젝트의 /webapp폴더에 존재함.
-	현재 test를 위하여 반복하여 결제를 할 수 있다. 현재 카카오머니, 현대카드 하나카드 등으로 테스트 가능, 결제한 내용은 밤에 일괄적으로 취소된다.
-	결제창은 기기에 따라 모바일결제창 혹은 PC결제창이 뜸
-	function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }
 
대회 등록 관리자 로그인(권한 adminm)
=====================
-	주소 : http://localhost:9000/adminm/adminmlogin
-	일반관리자 33333333333(11자리) 비밀번호 333(사용자 role ‘adminm) 또는 44444444444 444
(이외의 사용자는 권한이 없다는 메시지가 뜸)

경기장 선택(SelectVenue), 대회선택(SelectMatch)
  대회선택(SelectMatch) 화면에서 대회리스트 옆에 상황에 맞는 버튼이 나타난다.
  버튼 종류: 첨부보기 수정 삭제, 일괄입찰
  일괄입찰을 누르면 입찰액을 입력하고 제출할 수 있다.
일괄입찰(ReserveMatch)
  일괄입찰을 누르면 입찰액을 입력하고 제출할 수 있다.

대회등록(RegisterMatch)
-	툴바에서 선택하여 등록한다.
-	승인된 경기는 수정할 수 없으며 총괄관리자가 승인을 취소하면 대회 정보의 변경이 가능
 
총괄 관리자 로그인(권한 admin)
=================
-	http://localhost:9000/admin/adminlogin

경기장 선택(SelectVenue), 대회선택(SelectMatch)
  대회선택(SelectMatch) 화면에서 대회리스트 옆에 상황에 맞는 버튼이 나타난다.
  첨부보기 승인, 승인취소, 가격입력(UpdateSeatPrice), 일괄입찰(일괄입찰이 등록된 경우 나타남, reserveMatchAdmin)을 click하면 일괄입찰내용이 보이고 승인할 수 있다.
  대회 전체를 click하면 입찰현황 및 낙찰진행으로 이동한다.

입찰현황 및 낙찰진행(BidResults)
-	대회선택후 진행
-	입찰상태는 항상 maches의 입찰개시시간 입찰종료 시간을 기준으로 결정된다.
-	낙찰은 입찰이 종료된 건이 가능하며 이 경우 낙찰버튼이 보여진다.
-	전체좌석, 입찰된 건이 있는 내용을 보여준다.
-	입찰기간 중 조회하는 경우 중간에 데이터가 변경될 수 있어 데이터 가져오기 버튼을 누르면 refresh된다.
-	html에는 현재 40개 좌석이 표시됨.
-	낙찰이 종료되면 알림톡 보내기 버튼이 활성화되고, 보낸 후에는 비 활성화된다.  테스트를 위해 알림톡을 다시 보내고 싶은 경우에는 matches table에 alimtalk_sent의 ‘Y’를 ‘N’로 setting한다.

경기장관리(ManageVenue)
-	경기추가, 수정, 삭제 등을 수행한다.
-	수정, 삭제는 새로 추가한 대회를 대상으로 한다.

좌석가격 입력(UpdateSeatPrice)
-	기본가격은 1원부터 500000만원까지 가능(현재 프로그램에서 MAX_SEAT_PRICE로 정의됨)
-	대회목록의 버튼으로 선택
-	입찰개시전인 경우에만 새로 좌석을 생성하고 가격을 입력할 수 있다.
-	입찰개시전에는 수정이 가능하고 나머지는 조회가 가능하다.
-	입찰개시전이란 matches의 date를 기준으로 하므로 이를 변경하면 입찰개시전 입찰 중으로 상태가 변경된다. (테스트를 위해 승인을 취소 상태로 만든 후 대회관리에서 입찰 기간을 변경하여 좌석가격 입력을 테스트할 수 있다.)
-	중간에 테스트를 위해 좌석가격을 다시 입력하더라도 현재 입찰 내용에는 변함이 없다.


-- 입찰데이터터
CREATE TABLE `bids` (
  `match_no` int(11) DEFAULT NULL, -- 경기 번호
  `seat_no` varchar(10) NOT NULL, -- 좌석 번호
  `bid_telno` varchar(11) NOT NULL, -- 입찰자 전화번호
  `bid_amount` int(11) NOT NULL, -- 입찰 금액
  `bid_at` timestamp NOT NULL, -- 입찰 시간
  `bid_won` varchar(1) DEFAULT 'N', -- 낙찰 여부 ('Y', 'N')
  `bid_paid` varchar(1) DEFAULT 'N', -- 결제 여부 ('Y', 'N')
  `pay_method` varchar(45) DEFAULT NULL, -- 결제 방법
  `bid_userid` varchar(15) DEFAULT NULL, -- 입찰자 아이디(현재 전화번호호)
  `row_no` int(11) DEFAULT NULL, -- 좌석 행 번호
  `col_no` int(11) DEFAULT NULL, -- 좌석 열 번호
  `pay_oid` varchar(45) DEFAULT NULL -- 결제 고유 ID(inicis 결제 요청시 생성된 번호 기록록)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 입찰 사용자
CREATE TABLE `biduser` (
  `userid` varchar(30) DEFAULT NULL, -- 사용자 ID (현재는 사용하지 않음음)
  `password` varchar(100) NOT NULL, -- 비밀번호
  `username` varchar(30) NOT NULL, -- 사용자 이름
  `email` varchar(45) DEFAULT NULL, -- 이메일
  `telno` varchar(20) NOT NULL, -- 전화번호
  `postcode` varchar(10) DEFAULT NULL, -- 우편번호
  `addr1` varchar(45) DEFAULT NULL, -- 기본 주소
  `addr2` varchar(45) DEFAULT NULL, -- 상세 주소
  `created_at` datetime DEFAULT NULL, -- 생성 날짜
  `usertype` varchar(1) DEFAULT 'U', -- 사용자 유형 ('U': 일반 사용자, 현재는 사용하지 않음음)
  `id` bigint(20) NOT NULL AUTO_INCREMENT, -- 고유 ID
  `role` varchar(10) DEFAULT NULL, -- 사용자 역할
  PRIMARY KEY (`id`),
  UNIQUE KEY `telno_UNIQUE` (`telno`) -- 전화번호 유니크 키
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 경기 정보 테이블
CREATE TABLE `matches` (
  `match_no` int(11) NOT NULL, -- 경기 번호
  `venue_cd` varchar(3) NOT NULL, -- 경기장 코드
  `match_name` varchar(100) NOT NULL, -- 경기 이름
  `round` varchar(100) NOT NULL, -- 라운드 이름
  `approved` varchar(1) NOT NULL DEFAULT 'N', -- 승인 여부 ('Y', 'N')
  `bid_open_status` varchar(1) DEFAULT 'I', -- 입찰 오픈 상태 ('I': 준비 중. 'F' 낙찰완료 )
  `alimtalk_sent` varchar(1) DEFAULT 'N', -- 알림톡 발송 여부 ('Y', 'N')
  `bid_open_datetime` datetime DEFAULT NULL, -- 입찰 시작 시간
  `bid_close_datetime` datetime DEFAULT NULL, -- 입찰 종료 시간
  `alimtalk_sent_at` timestamp NULL DEFAULT NULL, -- 알림톡 발송 시간
  `start_date` date DEFAULT NULL, -- 경기 시작 날짜
  `start_time` time DEFAULT NULL, -- 경기 시작 시간
  `end_time` time DEFAULT NULL, -- 경기 종료 시간
  `approved_by` varchar(12) DEFAULT NULL, -- 승인자
  `created_by` varchar(11) NOT NULL DEFAULT 'null', -- 생성자
  `is_bid_available` varchar(1) DEFAULT 'N', -- 입찰 가능 여부 ('Y', 'N')
  `filename_attached` varchar(200) DEFAULT NULL, -- 첨부 파일 이름
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), -- 수정 시간
  `updated_by` varchar(11) DEFAULT NULL, -- 수정자 전화번호
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(), -- 생성 시간
  `pay_due_datetime` datetime DEFAULT NULL, -- 결제 기한
  `reserved` varchar(1) DEFAULT 'N', -- 일괄 입찰 여부 ('Y', 'N')
  `reserved_amount` int(11) DEFAULT 0, -- 일괄 입찰 금액
  `reserved_approval` varchar(1) DEFAULT 'N', -- 일괄 입찰 승인 여부 ('Y', 'N')
  `reserved_at` timestamp NULL DEFAULT current_timestamp(), -- 일괄 입찰 시간
  `reserved_approval_at` timestamp NULL DEFAULT NULL, -- 일괄 입찰 승인 시간
  PRIMARY KEY (`match_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- inicis 결제 요청 및 승인 기록 테이블
CREATE TABLE `payments` (
  `payDevice` varchar(20) DEFAULT NULL, -- 결제 장치(mobile, PC)
  `P_OID` varchar(50) DEFAULT NULL, -- 주문 번호
  `P_TRAN_TYPE` varchar(1) DEFAULT NULL, -- 거래 유형
  `P_AUTH_DT` varchar(45) DEFAULT NULL, -- 인증 날짜
  `P_AUTH_NO` varchar(20) DEFAULT NULL, -- 인증 번호
  `P_UNAME` varchar(50) DEFAULT NULL, -- 사용자 이름
  `P_EMAIL` varchar(45) DEFAULT NULL, -- 사용자 이메일
  `P_MOBILE` varchar(45) DEFAULT NULL, -- 사용자 휴대폰 번호
  `P_GOODS` varchar(45) DEFAULT NULL, -- 상품명
  `P_AMT` varchar(45) DEFAULT NULL, -- 결제 금액
  `P_TID` varchar(50) DEFAULT NULL, -- 거래 ID
  `P_TIMESTAMP` varchar(45) DEFAULT NULL, -- 거래 타임스탬프
  `P_HPP_METHOD` varchar(45) DEFAULT NULL, -- 결제 방법
  `P_STATUS` varchar(5) DEFAULT NULL, -- 결제 상태
  `P_CARD_NUM` varchar(50) DEFAULT NULL, -- 카드 번호
  `P_CARD_APPLPRICE` varchar(45) DEFAULT NULL, -- 카드 승인 금액
  `P_CARD_PRTC_CODE` varchar(5) DEFAULT NULL, -- 카드 PRTC 코드
  `P_CARD_INTEREST` varchar(45) DEFAULT NULL, -- 카드 이자
  `P_CARD_CHECKFLAG` varchar(5) DEFAULT NULL, -- 카드 체크 플래그
  `P_CARD_MEMBER_NUM` varchar(50) DEFAULT NULL, -- 카드 회원 번호
  `P_CARD_PURCHASE_NAME` varchar(50) DEFAULT NULL, -- 카드 발행사 이름
  `CARD_CorpFlag` varchar(5) DEFAULT NULL, -- 카드 회사 플래그
  `P_NOTEURL` varchar(255) DEFAULT NULL, -- 노트 URL
  `P_CARD_ISSUER_NAME` varchar(50) DEFAULT NULL, -- 카드 발급사 이름
  `P_CARD_ISSUER_CODE` varchar(5) DEFAULT NULL, -- 카드 발급사 코드
  `P_CARD_PURCHASE_CODE` varchar(5) DEFAULT NULL, -- 카드 발행사 코드
  `EventCode` varchar(50) DEFAULT NULL, -- 이벤트 코드
  `P_MERCHANT_RESERVED` varchar(255) DEFAULT NULL, -- 상점 예약 필드
  `P_MNAME` varchar(50) DEFAULT NULL, -- 상점 이름
  `P_RMESG2` varchar(10) DEFAULT NULL, -- 메시지 2
  `P_RMESG1` varchar(255) DEFAULT NULL, -- 메시지 1
  `P_NOTI` varchar(255) DEFAULT NULL, -- 알림 내용
  `P_FN_NM` varchar(50) DEFAULT NULL, -- 금융사 이름
  `P_MID` varchar(20) DEFAULT NULL, -- 상점 ID
  `P_TYPE` varchar(10) DEFAULT NULL, -- 거래 유형
  `P_FN_CD1` varchar(5) DEFAULT NULL, -- 금융 코드
  `P_INI_PAYMENT` varchar(45) DEFAULT NULL, -- 초기 결제
  `P_NOTI_URL` varchar(45) DEFAULT NULL, -- 알림 URL
  `resultCode` varchar(10) DEFAULT NULL, -- 결과 코드
  `resultMsg` varchar(255) DEFAULT NULL, -- 결과 메시지
  `MOID` varchar(50) DEFAULT NULL, -- MOID
  `applDate` varchar(45) DEFAULT NULL, -- 승인 날짜
  `applTime` varchar(45) DEFAULT NULL, -- 승인 시간
  `CARD_Quota` varchar(10) DEFAULT NULL, -- 카드 할부 기간
  `CARD_ClEvent` varchar(255) DEFAULT NULL, -- 카드 클리어 이벤트
  `parentEmail` varchar(100) DEFAULT NULL, -- 부모 이메일
  `OrgPrice` varchar(50) DEFAULT NULL, -- 원래 가격
  `p_Sub` varchar(255) DEFAULT NULL, -- 추가 필드
  `CARD_UsePoint` varchar(10) DEFAULT NULL, -- 카드 포인트 사용 여부
  `CARD_Num` varchar(20) DEFAULT NULL, -- 카드 번호
  `authSignature` varchar(255) DEFAULT NULL, -- 인증 서명
  `payMethod` varchar(20) DEFAULT NULL, -- 결제 방법
  `CARD_MemberNum` varchar(20) DEFAULT NULL, -- 카드 회원 번호
  `CARD_Point` varchar(10) DEFAULT NULL, -- 카드 포인트
  `currency` varchar(10) DEFAULT NULL, -- 통화 단위
  `CARD_PurchaseCode` varchar(10) DEFAULT NULL, -- 카드 구매 코드
  `CARD_PrtcCode` varchar(5) DEFAULT NULL, -- 카드 PRTC 코드
  `goodsName` varchar(255) DEFAULT NULL, -- 상품명
  `CARD_CheckFlag` varchar(5) DEFAULT NULL, -- 카드 체크 플래그
  `FlgNotiSendChk` varchar(10) DEFAULT NULL, -- 알림 발송 체크
  `CARD_Code` varchar(10) DEFAULT NULL, -- 카드 코드
  `CARD_BankCode` varchar(10) DEFAULT NULL, -- 카드 은행 코드
  `CARD_TerminalNum` varchar(50) DEFAULT NULL, -- 카드 단말기 번호
  `p_SubCnt` varchar(10) DEFAULT NULL, -- 추가 필드 수
  `applNum` varchar(20) DEFAULT NULL, -- 승인 번호
  `CARD_Interest` varchar(5) DEFAULT NULL, -- 카드 이자 여부
  `CARD_SrcCode` varchar(5) DEFAULT NULL, -- 카드 소스 코드
  `CARD_ApplPrice` varchar(45) DEFAULT NULL, -- 카드 승인 금액
  `CARD_GWCode` varchar(5) DEFAULT NULL, -- 카드 GW 코드
  `custEmail` varchar(100) DEFAULT NULL, -- 고객 이메일
  `CARD_Expire` varchar(10) DEFAULT NULL, -- 카드 만료 날짜
  `CARD_PurchaseName` varchar(100) DEFAULT NULL, -- 카드 구매사 이름
  `CARD_PRTC_CODE` varchar(5) DEFAULT NULL, -- 카드 PRTC 코드
  `P_USE_CHKFAKE` varchar(45) DEFAULT NULL -- 가짜 체크 플래그
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 리프레시 토큰 기록
CREATE TABLE `refresh` (
  `username` varchar(45) DEFAULT NULL, -- 사용자 이름
  `refresh` varchar(255) DEFAULT NULL, -- 리프레시 토큰
  `expiration` datetime DEFAULT NULL, -- 만료 시간
  `id` int(11) NOT NULL AUTO_INCREMENT, -- 고유 ID
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=963 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--경기별 좌석번호별 좌석 초기 가격
CREATE TABLE `seatprice` (
  `row_no` varchar(3) DEFAULT NULL, -- 좌석 행 번호
  `col_no` varchar(3) DEFAULT NULL, -- 좌석 열 번호
  `seat_no` varchar(3) NOT NULL, -- 좌석 번호
  `seat_price` int(11) NOT NULL, -- 좌석 가격
  `match_no` varchar(3) NOT NULL, -- 경기 번호
  PRIMARY KEY (`seat_no`,`match_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 경기장 코드 테이블
CREATE TABLE `venue_code` (
  `venue_cd` char(3) NOT NULL, -- 경기장 코드
  `venue_name` varchar(45) DEFAULT NULL, -- 경기장 이름
  `venue_place_info` varchar(45) DEFAULT NULL, -- 경기장 장소 정보
  `venue_general_info` varchar(45) DEFAULT NULL, -- 경기장 일반 정보
  `venue_img_file` varchar(100) DEFAULT NULL, -- 경기장 이미지 파일
  PRIMARY KEY (`venue_cd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
