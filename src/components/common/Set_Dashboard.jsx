import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
	Box,
	Button,
	Card,
	CircularProgress,
	Divider,
	IconButton,
	Paper,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";

import TopBar from "../common/TopBar.jsx";
import EmptySet from "./Empty_set.jsx";
import AddFlashcardButton from "../flashcardSets/AddFlashcardButton.jsx";
import AddQuestionButton from "../Quiz/AddQuestionButton.jsx";

const Set_Dashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();

	// Determine ID and type (quiz or flashcard set)
	const id = params.setId || params.quizId;
	const isQuiz = location.pathname.includes("/quizzes");
	const type = isQuiz ? "quiz" : "flashcard";

	const [setInfo, setSetInfo] = useState(null);
	const [items, setItems] = useState([]);
	const [editingItem, setEditingItem] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [scrollInfo, setScrollInfo] = useState({
		thumbPosition: 0,
		thumbHeight: 100,
		isDragging: false,
		startY: 0,
		scrollStartPosition: 0,
	});
	const listRef = useRef(null);
	const thumbRef = useRef(null);

	// Fetch metadata and items
	useEffect(() => {
		const fetchData = async () => {
			try {
				const infoRes = await fetch(
					`/api/${isQuiz ? "quizzes" : "sets"}/${id}`
				);
				const itemsRes = await fetch(
					`/api/${isQuiz ? "quizzes" : "sets"}/${id}/${isQuiz ? "questions" : "cards"}`
				);
				const infoJson = await infoRes.json();
				const itemsJson = await itemsRes.json();
				setSetInfo(infoJson);
				setItems(itemsJson);
			} catch (err) {
				console.error("Error fetching data:", err);
			}
		};
		fetchData();
	}, [id, isQuiz]);

	// Scroll thumb sizing/positioning omitted for brevity (unchanged)
	useEffect(() => {
		if (listRef.current) updateScrollThumbSize();
	}, [items]);
	useEffect(() => {
		if (!listRef.current) return;
		const handleScroll = () => {
			if (!scrollInfo.isDragging) updateScrollThumbPosition();
		};
		const handleMouseMove = (e) => {
			if (!scrollInfo.isDragging) return;
			e.preventDefault();
			const deltaY = e.clientY - scrollInfo.startY;
			const trackHeight = 580;
			const perc = deltaY / trackHeight;
			const containerH = listRef.current.clientHeight;
			const contentH = listRef.current.scrollHeight;
			listRef.current.scrollTop =
				scrollInfo.scrollStartPosition + perc * contentH;
			updateScrollThumbPosition();
		};
		const handleMouseUp = () => {
			if (scrollInfo.isDragging)
				setScrollInfo((prev) => ({ ...prev, isDragging: false }));
		};
		const el = listRef.current;
		el.addEventListener("scroll", handleScroll);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			el.removeEventListener("scroll", handleScroll);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [scrollInfo]);
	const updateScrollThumbSize = () => {
		const containerH = listRef.current.clientHeight;
		const contentH = listRef.current.scrollHeight;
		const track = 620;
		const thumbH =
			contentH <= containerH
				? track
				: Math.max(
						40,
						Math.min((containerH / contentH) * track, track)
					);
		setScrollInfo((prev) => ({ ...prev, thumbHeight: thumbH }));
	};
	const updateScrollThumbPosition = () => {
		const containerH = listRef.current.clientHeight;
		const contentH = listRef.current.scrollHeight;
		const scrollTop = listRef.current.scrollTop;
		const track = 620;
		const avail = track - scrollInfo.thumbHeight;
		const perc = scrollTop / (contentH - containerH);
		setScrollInfo((prev) => ({ ...prev, thumbPosition: perc * avail }));
	};
	const startDrag = (e) => {
		e.preventDefault();
		setScrollInfo((prev) => ({
			...prev,
			isDragging: true,
			startY: e.clientY,
			scrollStartPosition: listRef.current.scrollTop,
		}));
	};
	const trackClick = (e) => {
		if (e.target !== thumbRef.current) {
			const rect = e.currentTarget.getBoundingClientRect();
			const clickY = e.clientY - rect.top;
			const perc = clickY / 580;
			const containerH = listRef.current.clientHeight;
			const contentH = listRef.current.scrollHeight;
			listRef.current.scrollTop = perc * (contentH - containerH);
		}
	};

	// FIXED: Navigate back to the main dashboard
	const handleClose = () => {
		navigate("/"); // Navigate to dashboard instead of /quizzes or /sets
	};

	if (!setInfo) return <div>Loading...</div>;
	if (items.length === 0) {
		return (
			<EmptySet
				type={type}
				setName={isQuiz ? setInfo.name : setInfo.title}
				setId={id}
				onCreate={(newItem) => setItems((prev) => [...prev, newItem])}
			/>
		);
	}

	// Handlers for dialog operations
	const openDialog = (item) => {
		setEditingItem(item);
		setIsDialogOpen(true);
	};

	const closeDialog = () => {
		setEditingItem(null);
		setIsDialogOpen(false);
	};

	const handleDelete = (itemId) => {
		// First, update local state to remove the item immediately
		setItems((prev) => prev.filter((i) => i.id !== itemId));

		// Then call the API to delete the item on the server
		fetch(
			`/api/${isQuiz ? "quizzes" : "sets"}/${id}/${isQuiz ? "questions" : "cards"}/${itemId}`,
			{
				method: "DELETE",
			}
		)
			.then((res) => {
				if (!res.ok) {
					throw new Error("Delete failed");
					// If delete fails on server, we could refetch data here
				}
			})
			.catch((err) => {
				console.error("Error deleting item:", err);
				// Optionally refetch data to restore consistency
				// fetchData();
			});

		// Close the dialog after deletion
		closeDialog();
	};

	const handleUpdate = (updated) => {
		setItems((prev) =>
			prev.map((i) => (i.id === updated.id ? updated : i))
		);
		closeDialog();
	};

	// Progress value calculation - using the same value for both types for now
	// In a real app, this would likely come from user progress data
	const progressValue = 73;

	return (
		<Box
			sx={{
				backgroundImage: 'url("/background.png")',
				backgroundSize: "cover",
				backgroundPosition: "center",
				minHeight: "100vh",
				overflow: "hidden",
			}}
		>
			<TopBar />
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
				}}
			>
				<Box sx={{ width: "100%", maxWidth: "1920px" }}>
					<Box
						sx={{
							position: "relative",
							width: "100%",
							maxWidth: "1875px",
							height: "780px",
							mt: "120px",
							mx: "auto",
							borderRadius: "20px",
						}}
					>
						<Paper
							sx={{
								position: "absolute",
								width: "100%",
								height: "100%",
								bgcolor: "rgba(0, 0, 0, 0.75)",
								borderRadius: "20px",
								boxShadow:
									"15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
							}}
						/>
						<Box
							sx={{
								position: "absolute",
								top: "18px",
								left: "28px",
								display: "flex",
								alignItems: "center",
								width: "calc(100% - 56px)",
							}}
						>
							<Typography
								variant="h4"
								sx={{
									fontFamily: "Poppins-SemiBold, Helvetica",
									fontWeight: 600,
									color: "white",
									fontSize: "32px",
								}}
							>
								{isQuiz ? setInfo.name : setInfo.title}
							</Typography>
							<Box sx={{ flexGrow: 1 }} />
							<IconButton
								sx={{
									color: "white",
									mr: 1,
									"& .MuiSvgIcon-root": { fontSize: "32px" },
								}}
							>
								<UploadIcon />
							</IconButton>
							<IconButton
								onClick={handleClose}
								sx={{
									color: "white",
									"& .MuiSvgIcon-root": { fontSize: "32px" },
								}}
							>
								<CloseIcon />
							</IconButton>
						</Box>
						<Divider
							sx={{
								position: "absolute",
								top: "79px",
								left: "28px",
								width: "calc(100% - 56px)",
								bgcolor: "rgba(255, 255, 255, 0.5)",
								height: "6px",
								borderRadius: "3.5px",
							}}
						/>
						<Box
							sx={{
								position: "absolute",
								top: "108px",
								left: "17px",
								width: "calc(100% - 34px)",
								height: "650px",
								display: "flex",
							}}
						>
							{/* Left Panel: Items List */}
							<Box
								sx={{
									position: "relative",
									width: "calc(100% - 310px)",
									height: "100%",
									bgcolor: "rgba(0, 0, 0, 0.3)",
									borderRadius: "20px",
									overflowY: "auto",
									overflowX: "hidden",
								}}
							>
								{/* Custom Scrollbar Track */}
								<Box
									onClick={trackClick}
									sx={{
										position: "absolute",
										left: "11px",
										top: "15px",
										height: "628px",
										zIndex: 10,
										cursor: "pointer",
									}}
								>
									<Box
										sx={{
											width: "14px",
											height: "620px",
											bgcolor:
												"rgba(255, 255, 255, 0.45)",
											borderRadius: "20px",
											position: "relative",
										}}
									>
										<Box
											ref={thumbRef}
											onMouseDown={startDrag}
											sx={{
												width: "14px",
												height: `${scrollInfo.thumbHeight}px`,
												bgcolor:
													"rgba(255, 255, 255, 0.85)",
												borderRadius: "20px",
												position: "absolute",
												top: `${scrollInfo.thumbPosition}px`,
												cursor: "grab",
											}}
										/>
									</Box>
								</Box>
								<Box
									ref={listRef}
									sx={{
										pl: "38px",
										pr: "38px",
										pt: "20px",
										height: "calc(100% - 22px)",
										overflowY: "auto",
										"&::-webkit-scrollbar": {
											display: "none",
										},
									}}
								>
									{items.map((item) => (
										<Card
											key={item.id}
											sx={{
												position: "relative",
												height: "73px",
												bgcolor:
													"rgba(255, 255, 255, 0.45)",
												borderRadius: "20px",
												mb: 2,
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												px: 3,
												overflow: "hidden",
											}}
										>
											{/* Question & Answers Side */}
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
												}}
											>
												<Typography
													sx={{
														fontFamily:
															"Poppins-Medium, Helvetica",
														fontWeight: 500,
														color: "white",
														fontSize: "20px",
													}}
												>
													{isQuiz
														? item.text
														: item.question ||
															item.front}
												</Typography>
												<Typography
													sx={{
														fontFamily:
															"Poppins-Regular, Helvetica",
														color: "rgba(255, 255, 255, 0.5)",
														fontSize: "12px",
														lineHeight: "24px",
														mt: 0.5,
													}}
												>
													{isQuiz
														? item.answers
																.map(
																	(a) =>
																		`${a.text}${a.isCorrect ? " ✓" : ""}`
																)
																.join(", ")
														: item.answer ||
															item.back}
												</Typography>
											</Box>
											{/* Edit Button */}
											<Box>
												<Button
													variant="contained"
													onClick={() =>
														openDialog(item)
													}
													sx={{
														bgcolor: "#b75454",
														borderRadius: "15px",
														boxShadow:
															"0px 4px 4px rgba(0, 0, 0, 0.25)",
														textTransform: "none",
														px: "19px",
														py: "1.5px",
														minWidth: "140px",
														height: "44px",
														"&:hover": {
															bgcolor: "#a04848",
														},
													}}
												>
													<Typography
														sx={{
															fontFamily:
																"Poppins-Medium, Helvetica",
															fontWeight: 500,
															fontSize: "16px",
														}}
													>
														Edit
													</Typography>
												</Button>
											</Box>
										</Card>
									))}
								</Box>
							</Box>
							{/* Right Panel: Actions + Progress */}
							<Box
								sx={{
									width: "310px",
									height: "100%",
									ml: 2,
									display: "flex",
									flexDirection: "column",
								}}
							>
								<Button
									variant="contained"
									onClick={() => openDialog()}
									sx={{
										width: "100%",
										bgcolor: "#ffffff",
										borderRadius: "20px",
										textTransform: "none",
										py: 2,
										"&:hover": { bgcolor: "#a04848" },
									}}
								>
									<Typography
										sx={{
											fontFamily:
												"Poppins-Bold, Helvetica",
											fontWeight: 700,
											fontSize: "24px",
											color: "black",
										}}
									>
										{isQuiz ? "Add Questions" : "Add Cards"}
									</Typography>
								</Button>
								{/* Progress Section - Now for both quiz and flashcard types */}
								<Box
									sx={{
										flexGrow: 1,
										mt: 2,
										bgcolor: "rgba(0, 0, 0, 0.3)",
										borderRadius: "20px",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										pt: 2,
									}}
								>
									<Typography
										sx={{
											fontFamily:
												"Poppins-Medium, Helvetica",
											fontWeight: 500,
											color: "white",
											fontSize: "24px",
											mb: 4,
										}}
									>
										{isQuiz
											? `Questions (${items.length})`
											: `Cards in deck (${items.length})`}
									</Typography>

									{/* Progress circle display for both quiz and flashcard */}
									<Box sx={{ position: "relative", mt: 4 }}>
										<CircularProgress
											variant="determinate"
											value={progressValue}
											size={200}
											thickness={6}
											sx={{ color: "white" }}
										/>
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Typography
												sx={{
													fontFamily:
														"Poppins-SemiBold, Helvetica",
													fontWeight: 600,
													color: "white",
													fontSize: "48px",
												}}
											>
												{progressValue}%
											</Typography>
										</Box>
									</Box>
									<Typography
										sx={{
											fontFamily:
												"Poppins-SemiBold, Helvetica",
											fontWeight: 600,
											color: "white",
											fontSize: "24px",
											mt: 2,
										}}
									>
										Current progress
									</Typography>
								</Box>

								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mt: 2,
									}}
								>
									<IconButton
										sx={{
											width: "70px",
											height: "70px",
											bgcolor:
												"rgba(217, 217, 217, 0.13)",
											borderRadius: "35px",
										}}
									>
										<MoreVertIcon
											sx={{
												fontSize: "45px",
												color: "#d9d9d9",
											}}
										/>
									</IconButton>
									<Button
										variant="contained"
										onClick={() =>
											navigate(
												isQuiz
													? `/quizzes/${id}/view`
													: `/sets/${id}/view`
											)
										}
										sx={{
											bgcolor: "#b75454",
											borderRadius: "25px",
											textTransform: "none",
											px: "19px",
											py: "1.5px",
											minWidth: "219px",
											height: "70px",
											"&:hover": { bgcolor: "#a04848" },
										}}
									>
										<Typography
											sx={{
												fontFamily:
													"Poppins-Bold, Helvetica",
												fontWeight: 700,
												fontSize: "24px",
											}}
										>
											{isQuiz
												? "Take Quiz"
												: "Study Cards"}
										</Typography>
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
			{/* Dialog Components for Add/Edit */}
			{isDialogOpen &&
				(isQuiz ? (
					<AddQuestionButton
						quizId={id}
						isOpen={isDialogOpen}
						onClose={closeDialog}
						editQuestion={editingItem}
						onQuestionUpdated={handleUpdate}
						onQuestionCreated={(newQ) =>
							setItems((prev) => [...prev, newQ])
						}
						onQuestionDeleted={(itemId) => handleDelete(itemId)}
					/>
				) : (
					<AddFlashcardButton
						id={id}
						isOpen={isDialogOpen}
						onClose={closeDialog}
						editCard={editingItem}
						onCardUpdated={handleUpdate}
						onCardCreated={(newC) =>
							setItems((prev) => [...prev, newC])
						}
						onCardDeleted={(itemId) => handleDelete(itemId)}
					/>
				))}
		</Box>
	);
};

export default Set_Dashboard;
